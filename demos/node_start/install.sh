#!/bin/bash

echo $(whoami)
echo $(pwd)

# install nodejs
sudo yum update -y
curl –sL https://rpm.nodesource.com/setup_10.x | sudo bash -
sudo yum install –y nodejs

# ignore key check
chmod 600 ~/.ssh/id_rsa.pub
cat /home/vagrant/.ssh/id_rsa.pub >> /home/vagrant/.ssh/authorized_keys
sudo sed  -i '/StrictHostKeyChecking ask/c\\StrictHostKeyChecking no' /etc/ssh/ssh_config

# update default login directory
tee -a /home/vagrant/.bashrc <<-'EOF'
cd /home/vagrant/node_start
EOF

