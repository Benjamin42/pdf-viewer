var files = { 
	"EvansBk" : { "path" : "Bill Evans Fake Book.pdf", "inc" : 3},
	"Colorado" : { "path" : "COLOBK.PDF", "inc" : 3},
	"JazzFake" : { "path" : "Jazz Fake Book.pdf", "inc" : -1},
	"JazzLTD" : { "path" : "Jazz Ltd.pdf", "inc" : 7},
	"Library" : { "path" : "LIBRARY.PDF", "inc" : 4},
	"NewReal1" : { "path" : "The New Real Book I.pdf", "inc" : 15},
	"NewReal2" : { "path" : "The New Real Book II.pdf", "inc" : 11},
	"NewReal3" : { "path" : "The New Real Book III.pdf", "inc" : 10},
	"Realbk1" : { "path" : "The Real Book Volume I.pdf", "inc" : 8},
	"RealBk2" : { "path" : "The Real Book Volume II.pdf", "inc" : 7},
	"RealBk3" : { "path" : "The Real Book Volume III.pdf", "inc" : 5},
};

var pdfjsLib = window['pdfjs-dist/build/pdf'];
	
// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = './dist/pdf/build/pdf.worker.js';

$(document).ready( function () {
	// Loaded via <script> tag, create shortcut to access PDF.js exports.
	//var url = "../helloworld.pdf";
	var url = "../COLOBK.PDF"
	
	var loadingTask = pdfjsLib.getDocument(url);
	loadingTask.promise.then(function(pdf) {
	  console.log('PDF loaded');
	  
	  // Fetch the first page
	  var pageNumber = 1;
	  pdf.getPage(pageNumber).then(function(page) {
	    console.log('Page loaded');
	    
	    var scale = 1;
	    var viewport = page.getViewport();

	    // Prepare canvas using PDF page dimensions
	    var canvas = document.getElementById('the-canvas');
	    var context = canvas.getContext('2d');
	    canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 50;
	    //canvas.height = viewport.height;
	    //canvas.width = viewport.width;

	    // Render PDF page into canvas context
	    var renderContext = {
	      canvasContext: context,
	      viewport: viewport
	    };
	    var renderTask = page.render(renderContext);
	    renderTask.promise.then(function () {
	      console.log('Page rendered');
	    });
	  });
	}, function (reason) {
	  // PDF loading error
	  console.error(reason);
	});




	// Load data from sessionStorage if exists
	if (typeof sessionStorage != 'undefined') {
    	if ("data" in sessionStorage) {
    		data = JSON.parse(sessionStorage.data);
    	}
    }

    drawListTable();

    drawBookmarksTable();
});

drawListTable = function() {
    // Draw lines in table
    var lines = "";
	for (i in data) {
		//$('#listTable > tbody:last-child').append(constructLine(i));
		lines += constructLine(i);
	}

	$('#listContent').html(constructTable("listTable", lines));

    $('#listTable').DataTable({
    	"order" : [[ 1, "asc"], [2, "asc"]]
    });	
}

drawBookmarksTable = function() {
	var lines = "";
	for (i in data) {
		if (data[i].bookmarked) {
			lines += constructLine(i);
		}
	}
	if (lines != "") {
		$('#bookmarksContent').html(constructTable("bookmarksTable", lines));

	    $('#bookmarksTable').DataTable({
	    	"order" : [[ 1, "asc"], [2, "asc"]]
	    });
	} else {
		$("#bookmarksContent").html("<div class='alert alert-warning' role='alert'>You have no bookmarks !</div>");
	}
}

constructLine = function(id) {
	var line = "";
	line += "<tr" + (data[id].book == "NewReal1" || data[id].book == "NewReal2" || data[id].book == "NewReal3" ? " class='table-danger'" : "") + ">";
	line += "	<td align='center' id='bookmark_" + i + "'>" + constructButton(i) + "</td>";
	line += "	<td>" + data[id].title + "</td>";
	line += "	<td>" + data[id].book + "</td>";
	line += "	<td>" + data[id].page + "</td>";
	line += "	<td><button class='btn btn-sm btn-outline-primary' onclick='loadPage(" + i + ");'>Show</button></td>";
	line += "</tr>";
	return line;
}

constructTable = function(idName, lines) {
	var strTable = ""
	strTable += "<table id='" + idName + "' class='table table-sm compact'>";
	strTable += "	<thead>";
	strTable += "		<tr>";
	strTable += "			<th width='60px;'></th>";
	strTable += "			<th>Title</th>";
	strTable += "			<th>Book</th>";
	strTable += "			<th>Page</th>";
	strTable += "			<th>&nbsp;</th>";
	strTable += "		</tr>";
	strTable += "	</thead>";
	strTable += "	<tbody>";
	strTable += lines;
	strTable += "	</tbody>";
	strTable += "</table>";		
	return strTable;
}

constructButton = function(id) {
	if (data[id].bookmarked) {
		return "<button class=\"btn btn-sm btn-outline-primary\" onclick='unBookMark(\"" + id + "\");'>Remove</button>";	
	} else {
		return "<button class=\"btn btn-sm btn-outline-primary\" onclick='addBookMark(\"" + id + "\");'>Add</button>";	
	}
}

loadPage = function(id) {
	var file = files[data[id].book];
	$('#embedPdf').prop("data", "../" + file.path + "#page=" + (data[id].page + file.inc));
}

addBookMark = function(id) {
	if (typeof sessionStorage != 'undefined') {
		data[id].bookmarked = true;
		sessionStorage.data = JSON.stringify(data);
		$("#bookmark_" + id).html(constructButton(id));
		drawBookmarksTable();
	}
}

unBookMark = function(id) {
	if (typeof sessionStorage != 'undefined') {
		data[id].bookmarked = false;
		sessionStorage.data = JSON.stringify(data);
		$("#bookmark_" + id).html(constructButton(id));
		drawBookmarksTable();
	}
}