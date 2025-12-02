$(document).ready(function() {
    $('.accordion-header').click(function() {
        const $item = $(this).parent();
        
        if ($item.hasClass('active')) {
            $item.removeClass('active');
        } else {
            $('.accordion-item').removeClass('active');
            $item.addClass('active');
        }
    });
});