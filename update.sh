echo catBot installer

read -p "Git Pull? [y/N]" v_pull
if [ $v_pull = "y" ]
then 
echo running Git Pull 
git pull
else 
echo skipping Git Pull
fi
sleep 1

read -p "Install NPM packages? [y/N]" v_pack
if [ $v_pack = "y" ]
then
echo Installing any new packages
npm install
else 
echo "skipping install new packages"
fi
sleep 1

echo restarting catbot...
pm2 restart catbot
sleep 1

pm2 reset catbot

read -p "Load PM2 Dash? [y/N]" v_dash
if [ $v_dash = "y" ]
then
echo Loading Dash...
pm2 dash
else 
echo ...done...
fi