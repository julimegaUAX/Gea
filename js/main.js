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

    // Menú hamburguesa
    const menuIcon = document.getElementById('menu-icon');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuIcon && mobileMenu) {
        menuIcon.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
            });
        });
    }
});
