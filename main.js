'use strict';

Zepto(function ($) {
    var imageLoader = $('#imageLoader');
    var canvas = $('#canvas')[0];
    var ctx = canvas.getContext('2d');
    var cam;

    var original_img;

    function loadImage(e) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var img = new Image();
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.removeAttribute("data-caman-id");
                ctx.drawImage(img, 0, 0);
                original_img = canvas.toDataURL();
                $('#Filters').show();

                cam = Caman(canvas);
                $(".slider input").each(function () {

                    $(this).parent().parent().find(".FilterValue").html($(this).val());
                });
                rerender();
            }
            img.src = event.target.result;

        }
        if (e.target.files.length)
            reader.readAsDataURL(imageLoader[0].files[0]);
    }

    imageLoader.on('change', loadImage);

    var b = {};

    function rerender(revert) {
        $('#canvas').toggleClass('proc', true);


        var jpeg_times = parseInt($('#jpeg_times').val());
        var jpeg_quality = parseFloat($('#jpeg_quality').val());

        $('#jpeg_times').parent().parent().toggleClass('faded', jpeg_times === 0);
        $('#jpeg_quality').parent().parent().toggleClass('faded', jpeg_times === 0);
        var img = new Image();

        var jpeg_counter = jpeg_times;
        var jpegize = function () {
            ctx.drawImage(img, 0, 0);
            if (jpeg_counter > 0) {
                $('#statustext').html('<i class="em em-sparkles"></i>&nbsp; JPEGing - ' + (jpeg_times - jpeg_counter) + '/' + jpeg_times);
                jpeg_counter--;
                img.src = canvas.toDataURL("image/jpeg", jpeg_quality + Math.random() * 0.1 - 0.05);
            } else {
                $('#statustext').html('<i class="em em-art"></i>&nbsp; applying filters');
                cam.reloadCanvasData();
                $.each(b, function (j, i) {
                    var k = b[j];
                    k = parseFloat(k, 10);
                    if (k !== 0) {
                        cam[j](k);
                    }
                });
                cam.render(function(){
                    $('#statustext').html('<i class="em em-ok_hand"></i>');
                    $('#canvas').toggleClass('proc', false);
                });
               
                return;
            }
        };
        img.onload = jpegize;
        img.src = original_img;


    }

    $(".FilterSetting input").each(function () {
        var j;
        j = $(this).data("filter");
        return b[j] = $(this).val()
    });
    $("#Filters").on("change", ".slider input", function () {
        var j, k;
        j = $(this).data("filter");
        k = $(this).val();
        if (j)
            b[j] = k;
        $(this).parent().parent().find(".FilterValue").html(k);
        rerender(true);
    });
});