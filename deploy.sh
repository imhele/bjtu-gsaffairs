git pull
yarn install
yarn build
cd ./serve
yarn stop
npm install --production
tsc -p tsconfig.json
yarn start
