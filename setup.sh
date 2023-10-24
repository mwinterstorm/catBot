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