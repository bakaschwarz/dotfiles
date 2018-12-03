# Defined in - @ line 0
function open_ports --description 'alias open_ports=sudo ss -plnt'
	sudo ss -plnt $argv;
end
