# Remove the annoying greeting
set fish_greeting ""

# functions

function add_key
     gpg --recv-keys $argv[1]
     gpg --lsign $argv[1]
end