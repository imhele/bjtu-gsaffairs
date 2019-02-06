import moment from 'moment';

export const formatMoment = {
  Y: 'YYYY',
  YM: 'YYYY-MM',
  YMD: 'YYYY-MM-DD',
  YMDH: 'YYYY-MM-DD HH',
  YMDHm: 'YYYY-MM-DD HH:mm',
  YMDHms: 'YYYY-MM-DD HH:mm:ss',
  M: 'MM',
  MD: 'MM-DD',
  MDH: 'MM-DD HH',
  MDHm: 'MM-DD HH:mm',
  MDHms: 'MM-DD HH:mm:ss',
  D: 'DD',
  DH: 'DD HH',
  DHm: 'DD HH:mm',
  DHms: 'DD HH:mm:ss',
  H: 'HH',
  Hm: 'HH:mm',
  Hms: 'HH:mm:ss',
};

export const formatMomentInForm = (values: object, format: string): object | string => {
  if (moment.isMoment(values)) return values.format(format);
  if (typeof values !== 'object') return values;
  Object.entries(values).forEach(([k, v]) => {
    if (moment.isMoment(v)) {
      values[k] = v.format(format);
    } else if (Array.isArray(v)) {
      values[k] = v.map(i => formatMomentInForm(i, format));
    } else {
      try {
        values[k] = formatMomentInForm(v, format);
      } catch {}
    }
  });
  return values;
};
