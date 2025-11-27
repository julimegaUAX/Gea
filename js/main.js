// Acordeón FAQ usando jQuery
$(document).ready(function() {
    // Manejar clic en los headers del acordeón
    $('.accordion-header').click(function() {
        const $item = $(this).parent();
        
        // Si el item clickeado ya está activo, cerrarlo
        if ($item.hasClass('active')) {
            $item.removeClass('active');
        } else {
            // Cerrar todos los otros items
            $('.accordion-item').removeClass('active');
            // Abrir el item clickeado
            $item.addClass('active');
        }
    });
    
    // Smooth scroll para enlaces de navegación
    $('a[href^="#"]').on('click', function(e) {
        const target = $(this.getAttribute('href'));
        if (target.length) {
            e.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 80
            }, 800);
        }
    });
});