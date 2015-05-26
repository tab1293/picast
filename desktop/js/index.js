var ipc = require('ipc');
var videos = ipc.sendSync('getVideos');
console.log('hello');
        
       // $(function() {
        //     console.log('hello');
        //     var dropZone = document.getElementById('body');

        //      // Get file data on drop
        //     // Get file data on drop
        //     dropZone.addEventListener('drop', function(e) {
        //         e.stopPropagation();
        //         e.preventDefault();
        //         var files = e.dataTransfer.files; // Array of all files
        //         for(var i=0; i < files.length; i++) {
        //             console.log(file.path);
        //         }
        //     });

        // });