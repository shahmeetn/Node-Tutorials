$('.upload-btn').on('click', function () {
    $('#upload-input').click();
});

$('#upload-input').on('change', function () {
    var files = $(this).get(0).files;

    if (files.length > 0) {
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            formData.append('uploads[]', file, file.name);
        }
        $.ajax({
            url: '/image/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                window.location = 'localhost:3000/video';
            }
        });
    }
});