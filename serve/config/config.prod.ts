import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {
    sequelize: {
      dialect: 'mysql', // support: mysql, mariadb, postgres, mssql
      database: 'bjtu_papms',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'Fly999887',
      // delegate: 'myModel', // load all models to `app[delegate]` and `ctx[delegate]`, default to `model`
      // baseDir: 'my_model', // load all files in `app/${baseDir}` as models, default to `model`
      // exclude: 'index.ts', // ignore `app/${baseDir}/index.js` when load models, support glob and array
      operatorsAliases: false,
      define: {
        freezeTableName: true,
        timestamps: false,
        underscored: true,
      },
      cluster: {
        listen: { path: 'unix:///tmp/bjtu-papms.sock' },
      },
    },
  };
  return config;
};
