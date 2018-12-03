# Remove the annoying greeting
set fish_greeting ""

# Add Go binaries to PATH
set PATH $PATH $HOME/.go/bin $HOME/.config/composer/vendor/bin/

# functions

function add_key
     gpg --recv-keys $argv[1]
     gpg --lsign $argv[1]
end

function update
    git pull --rebase
    if [ $status = 128 ]
        svn update .
    end
end

function libreccm
    
end

function tablet
    xsetwacom set 10 MapToOutput 2304x1440+2396+0
    xsetwacom set 22 MapToOutput 2304x1440+2396+0
end

#alias edit_fish="micro ~/.config/fish/config.fish"

#alias open_ports="sudo ss -plnt"