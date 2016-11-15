$(document).ready( function() {

    (function init_option_listener() {
        var last_opt_id = 1;

        function opt_box_name(index) {
            return '#option-input-box-' + index.toString();
        }

        function add_new_option() {
            $( opt_box_name(last_opt_id) ).off( 'keypress', add_new_option );

            last_opt_id++;
            $('#option-input-container').append(
                '<tr>' +
                '<th>' + (last_opt_id + 1) + '.</th>' +
                '<td><input type="text" placeholder="Enter poll option" name="poll[choice-' +
                    last_opt_id + ']" id="option-input-box-' + last_opt_id + '"></td>' +
                '</tr>'
            );

            $( opt_box_name(last_opt_id) ).on( 'keypress', add_new_option );
        }

        $( opt_box_name(last_opt_id) ).on( 'keypress', add_new_option );
    })();


});
