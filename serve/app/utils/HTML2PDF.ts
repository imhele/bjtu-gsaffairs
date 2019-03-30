import { spawn, ChildProcess } from 'child_process';
import slang from 'slang';
import isStream from 'is-stream';

const quote = (val: string) => {
  // escape and quote the value if it is a string and this isn't windows
  if (typeof val === 'string' && process.platform !== 'win32') {
    val = '"' + val.replace(/(["\\$`])/g, '\\$1') + '"';
  }
  return val;
};

const wkhtmltopdf = (input: string, options: any = {}, callback?: any) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const output = options.output;
  delete options.output;
  // make sure the special keys are last
  const extraKeys: string[] = Object.keys(options).filter(key => {
    return ['toc', 'cover', 'page'].includes(key);
  });
  let keys: string[] = Object.keys(options)
    .filter(key => !extraKeys.includes(key))
    .concat(extraKeys);

  // make sure toc specific args appear after toc arg
  if (keys.indexOf('toc') >= 0) {
    const tocArgs: string[] = [
      'disableDottedLines',
      'tocHeaderText',
      'tocLevelIndentation',
      'disableTocLinks',
      'tocTextSizeShrink',
      'xslStyleSheet',
    ];
    const myTocArgs: string[] = [];
    keys = keys.filter(key => {
      if (tocArgs.includes(key)) {
        myTocArgs.push(key);
        return false;
      }
      return true;
    });
    keys.splice(keys.indexOf('toc') + 1, 0, ...myTocArgs);
  }
  const args: string[] = [wkhtmltopdf.command];
  if (!options.debug) args.push('--quiet');
  keys.forEach(key => {
    const val = options[key];
    // skip adding the ignore/debug keys
    if (['ignore', 'debug', 'debugStdOut'].includes(key)) return false;
    if (!['toc', 'cover', 'page'].includes(key))
      key = key.length === 1 ? '-' + key : '--' + slang.dasherize(key);
    if (Array.isArray(val)) {
      // add repeatable args
      val.forEach(valueStr => {
        args.push(key);
        if (Array.isArray(valueStr)) args.push(...valueStr.map(quote));
        else args.push(quote(valueStr));
      });
    } else {
      // add normal args
      if (val !== false) args.push(key);
      if (typeof val !== 'boolean') args.push(quote(val));
    }
  });

  const isUrl = /^(https?|file):\/\//.test(input);
  args.push(isUrl ? quote(input) : '-'); // stdin if HTML given directly
  args.push(output ? quote(output) : '-'); // stdout if no output file
  // show the command that is being run if debug opion is passed
  if (options.debug && !(options instanceof Function)) {
    console.log('[node-wkhtmltopdf] [debug] [command] ' + args.join(' '));
  }

  let child: ChildProcess;
  if (process.platform === 'win32') {
    child = spawn(args[0], args.slice(1));
  } else if (process.platform === 'darwin') {
    child = spawn('/bin/sh', ['-c', args.join(' ') + ' | cat ; exit ${PIPESTATUS[0]}']);
  } else {
    // this nasty business prevents piping problems on linux
    // The return code should be that of wkhtmltopdf and not of cat
    // http://stackoverflow.com/a/18295541/1705056
    child = spawn(wkhtmltopdf.shell, ['-c', args.join(' ') + ' | cat ; exit ${PIPESTATUS[0]}']);
  }

  const stream = child.stdout;
  const stderrMessages: string[] = [];

  // call the callback with null error when the process exits successfully
  child.on('exit', function(code) {
    if (code !== 0) {
      stderrMessages.push('wkhtmltopdf exited with code ' + code);
      handleError(stderrMessages);
    } else if (callback) {
      callback(null, stream); // stream is child.stdout
    }
  });

  // setup error handling
  function handleError(err: any) {
    let errObj: Error = null!;
    if (Array.isArray(err)) {
      // check ignore warnings array before killing child
      if (options.ignore && options.ignore instanceof Array) {
        const ignoreError: boolean = options.ignore.forEach((opt: string | RegExp) => {
          return err.some(error => {
            if (typeof opt === 'string' && opt === error) return true;
            return opt instanceof RegExp && error.match(opt);
          });
        });
        if (ignoreError) return true;
      }
      errObj = new Error(err.join('\n'));
    } else if (err) errObj = new Error(err);
    child.removeAllListeners('exit');
    child.kill();
    // call the callback if there is one
    if (callback) callback(errObj);
    // if not, or there are listeners for errors, emit the error event
    else if (stream.listeners('error').length > 0) stream.emit('error', errObj);
  }

  child.once('error', err => {
    throw err; // critical error
  });

  child.stderr.on('data', data => {
    stderrMessages.push(`${data || ''}`);
    if (options.debug instanceof Function) {
      options.debug(data);
    } else if (options.debug) {
      console.log('[node-wkhtmltopdf] [debug] ' + data.toString());
    }
  });

  if (options.debugStdOut && !output) {
    throw new Error("debugStdOut may not be used when wkhtmltopdf's output is stdout");
  }

  if (options.debugStdOut && output) {
    child.stdout.on('data', data => {
      if (options.debug instanceof Function) {
        options.debug(data);
      } else if (options.debug) {
        console.log('[node-wkhtmltopdf] [debugStdOut] ' + data.toString());
      }
    });
  }

  // write input to stdin if it isn't a url
  if (!isUrl) {
    // Handle errors on the input stream (happens when command cannot run)
    child.stdin.on('error', handleError);
    if (isStream(input)) input.pipe(child.stdin);
    else child.stdin.end(input);
  }

  // return stdout stream so we can pipe
  return stream;
};

wkhtmltopdf.command = 'wkhtmltopdf';
wkhtmltopdf.shell = '/bin/bash';
export default wkhtmltopdf;
