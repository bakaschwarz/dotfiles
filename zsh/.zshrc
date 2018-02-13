#!/bin/zsh

# LOAD ZPLUG
source ~/.zplug/init.zsh

# ALIASES
alias la="ls -la"
alias reload="source ~/.zshrc"

# FUNCTIONS
f () {
    find $1 -iname $2
}

ff () {
    find . -iname $1
}

add_missing_key() {
	gpg --recv-keys $1
	gpg --lsign $1
}

# ENVIRONMENT
PATH=$PATH:/home/baka/.gem/ruby/2.3.0/bin
PATH=$PATH:/home/baka/cloud/scripts

# ZSH THEME
zplug "LasaleFamine/phi-zsh-theme", as:theme

# ZSH PLUGINS
zplug "yous/vanilli.sh" # Mmmh, vanilla
zplug "mollifier/cd-gitroot" # Quick jump to git root
zplug "djui/alias-tips" # Remember aliases
zplug "chrissicool/zsh-256color" # Make it colorful!
zplug "zsh-users/zsh-syntax-highlighting" # Highlighting your life!
zplug "zsh-users/zsh-autosuggestions" # Knows what you want
zplug "zsh-users/zsh-completions" # More completions!
zplug "zuxfoucault/colored-man-pages_mod" # Colors for man pages
zplug "b4b4r07/enhancd", use:init.sh # More cd functions
zplug "popstas/zsh-command-time" # Time stats for long commands
zplug "RobSis/zsh-completion-generator" # Generate autocompletion
zplug "jreese/zsh-opt-path" # Automatically add /opt/ paths
zplug "jocelynmallon/zshmarks" # Navigate faster!

# INSTALL PLUGINS IF NEEDED
if ! zplug check --verbose; then
    printf "Install? [y/N]: "
    if read -q; then
        echo; zplug install
    fi
fi

# LOAD PLUGINS
zplug load

# LOAD SYSTEM SPECIFIC SETTINGS
source ~/.zshrc.local