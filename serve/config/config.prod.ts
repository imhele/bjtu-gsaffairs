import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {
    // ref: https://github.com/eggjs/egg-sequelize
    sequelize: {
      dialect: 'mysql', // support: mysql, mariadb, postgres, mssql
      database: 'test',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      // delegate: 'myModel', // load all models to `app[delegate]` and `ctx[delegate]`, default to `model`
      // baseDir: 'my_model', // load all files in `app/${baseDir}` as models, default to `model`
      exclude: 'index.ts', // ignore `app/${baseDir}/index.js` when load models, support glob and array
      define: {
        freezeTableName: true,
        timestamps: false,
        underscored: true,
      },
    },
  };
  return config;
};
