sudo yarn install
sudo git pull
sudo yarn build
cd ./serve
sudo yarn stop
sudo npm install --production
sudo tsc -p tsconfig.json
sudo yarn start
