# Remove the annoying greeting
set fish_greeting ""

# Add Go binaries to PATH
set PATH $PATH $HOME/.go/bin

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