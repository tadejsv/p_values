// Create tables on load
$( document ).ready(function() {
    update_tables();
});

// Clear all (sets all values in tables to 0 and clear results)
var clearAll = function () {
  tables = ["#table_a", "#table_b", "#table_p"];

  for (var i = 0; i < tables.length; i++) {
    var tableData = $(tables[i]).find('td');
    tableData.each(function() {$(this)[0].innerHTML = "0";});
  };

  // Empty results
  $("#results-txt").html("");
};

// Function to calculate the p-value
var calculate = function() {
  // Empty results
  $("#results-txt").html("");

  // Get the sum of the probabilities
  var probs = getTableArray("table_p"), probSum = 0;
  for(var i = 0; i < probs.length; i++) {
    for(var j =0; j < probs[0].length; j++) {
      probSum += parseFloat(probs[i][j]);
    }
  }

  // Report error if probabilities do not sum up to (close to) 1
  if(Math.abs(probSum-1) > 1e-10) {
    alert("Error: The probabilities do not sum up to 1.")
    return;
  }

  // Disable the calculation button
  $("#calcButton").prop("disabled", true);
  $("#calcButton").html("Calculating...");

  var a_data = getTableArray("table_a"),
      b_data = getTableArray("table_b"),
      p_data = getTableArray("table_p");

  var steps = 1;
  var max_step = 10;
  var check_p = function(p_val) {
    $.ajax({
      method: "GET",
      url: calculate_url,
      data: {"player_a[]": a_data,
             "player_b[]": b_data,
             "probabilities[]": p_data,
             "p_value": p_val
         },
      success: function(data, textStatus, jqXHR) {
        if(steps <= max_step) {
          success = data["success"]
          success_str = success ? " <span style=\"color:blue\">success</span>" : " <span style=\"color:red\">fail</span>"
          $("#results-txt").append("<span> Step " + steps + ": " + p_val + success_str + "</span><br>");

          steps++;
          check_p(p_val + (success ? 0.25*Math.pow(0.5, steps-2) : -0.25*Math.pow(0.5, steps-2)));
        } else {
          var list = data["matrix"],
              dims = data["dims"],
              matrix = [];

          var low = p_val - 0.25*(0.5)**(steps-2),
              high = p_val + 0.25*(0.5)**(steps-2);

          $("#results-txt").append("<p> The p-value is between " + low + " and " + high + "</p>");
          $("#results-txt").append("<h5> Doubled matrix example: </h5>");

          while(list.length) matrix.push(list.splice(0,2*dims[1]));
          table_cnt = drawTable(dims[0]*2, dims[1]*2, matrix, true)
          $("#results-txt").append("<table class=\"table table-sm table-responsive\">"+table_cnt+"</table>");

          // Enable the calculation button
          $("#calcButton").prop("disabled", false);
          $("#calcButton").html("Calculate");
        }
      }
    });
  };

  check_p(0.5);
}

// Configure selectors to update tables on change
$(".spinner")
  .spinner('delay', 200) //delay in ms
  .spinner('changed', function(e, newVal, oldVal) {
    update_tables();
  });

// Function to update the tables, keeping old values if possible
var update_tables = function() {
  var a_cols = $("#an").val(),
      b_cols = $("#bn").val();

  var a_data = getTableArray("table_a"),
      b_data = getTableArray("table_b"),
      p_data = getTableArray("table_p");

  var a_table = drawTable(a_cols, b_cols, a_data),
      b_table = drawTable(a_cols, b_cols, b_data),
      p_table = drawTable(a_cols, b_cols, p_data);

  $("#table_a").html(a_table);
  $("#table_b").html(b_table);
  $("#table_p").html(p_table);

  $('#table_a').editableTableWidget().numericInputExample();
  $('#table_b').editableTableWidget().numericInputExample();
  $('#table_p').editableTableWidget().numericInputExample(true);
};

// Functions to create the html of the tables
var drawTable = function(a_row, b_row, data, double) {
  var header = "<thead>\n<tr>\n<th scope=\"col\"></th>\n";
  var body = "<tbody>\n<tr>\n";
  var i = 0, j=0;

  // Existing data dimension
  var d_a = data.length, d_b = 0;
  d_b = d_a ? data[0].length : 0;

  // Create the table header
  for(i=0; i<b_row; i++) {
    var index = double ? i % (b_row/2) : i;
    header +=  "<th scope=\"col\">B<span class=\"index\">"+(index+1)+"<span/></th>\n";
  }
  header += "</tr>\n</thead>\n";

  // Create the table rows
  for(j=0; j<a_row; j++) {
    var index = double ? j % (a_row/2) : j;
    body += "<th scope=\"row\">A<span class=\"index\">"+(index+1)+"</span></th>\n";
    for(i=0; i<b_row; i++) {
      // If old data exists, use it - otherwise use 0
      cell_data = double ? data[j][i].toFixed(4) : (j < d_a & i < d_b ? data[j][i] : 0);
      body += "<td>"+ cell_data +"</td>\n";
    }
    body += "</tr>\n";
  }
  body += "</tbody>\n";

  // Return the table HTML
  return header + body;
};

// Validator for table cells (so they are numeric, and between 0 and 1 in case of probabilities)
$.fn.numericInputExample = function (probabilities) {
	'use strict';
	var element = $(this);

	element.find('td').on('validate', function (evt, value) {
		var cell = $(this),
		    isnum = !isNaN(parseFloat(value)) && isFinite(value),
        isProb = (parseFloat(value) >= 0) && (parseFloat(value) <= 1);

    return probabilities ? (isnum && isProb) : isnum;
	});

	return this;
};

// Function that return the table contets in an html array
var getTableArray = function(name) {
  rows = "#" + name + " tr";

  var myTableArray = [];
  $(rows).each(function() {
    var arrayOfThisRow = [];
    var tableData = $(this).find('td');
    if (tableData.length > 0) {
        tableData.each(function() { arrayOfThisRow.push($(this).text()); });
        myTableArray.push(arrayOfThisRow);
    }
  });

  return myTableArray;
}
