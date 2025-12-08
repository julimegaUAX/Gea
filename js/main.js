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

    // Menú desplegable
    document.getElementById('menu-icon').addEventListener('click', function() {
        const menu = document.querySelector('.menu-desplegable');
        const overlay = document.getElementById('menu-overlay');
        const menuIcon = document.getElementById('menu-icon');
        const closeIcon = document.getElementById('close-icon');
        
        menu.classList.add('active');
        overlay.classList.add('active');
        menuIcon.style.display = 'none';
        closeIcon.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    document.getElementById('close-icon').addEventListener('click', function() {
        const menu = document.querySelector('.menu-desplegable');
        const overlay = document.getElementById('menu-overlay');
        const menuIcon = document.getElementById('menu-icon');
        const closeIcon = document.getElementById('close-icon');
        
        menu.classList.remove('active');
        overlay.classList.remove('active');
        menuIcon.style.display = 'block';
        closeIcon.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Cerrar menú al hacer click en el overlay
    document.getElementById('menu-overlay').addEventListener('click', function() {
        const menu = document.querySelector('.menu-desplegable');
        const overlay = document.getElementById('menu-overlay');
        const menuIcon = document.getElementById('menu-icon');
        const closeIcon = document.getElementById('close-icon');
        
        menu.classList.remove('active');
        overlay.classList.remove('active');
        menuIcon.style.display = 'block';
        closeIcon.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
});
