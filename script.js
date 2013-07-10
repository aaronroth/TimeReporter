var monthStrings = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var periodSelection;
var userInfo;
var userInfoDefault = {
	'Sun':['0:00 --', '0:00 --', '0:00 --', '0:00 --', '0'],
	'Mon':['0:00 --', '0:00 --', '0:00 --', '0:00 --', '0'],
	'Tue':['0:00 --', '0:00 --', '0:00 --', '0:00 --', '0'],
	'Wed':['0:00 --', '0:00 --', '0:00 --', '0:00 --', '0'],
	'Thu':['0:00 --', '0:00 --', '0:00 --', '0:00 --', '0'],
	'Fri':['0:00 --', '0:00 --', '0:00 --', '0:00 --', '0'],
	'Sat':['0:00 --', '0:00 --', '0:00 --', '0:00 --', '0'],
};

$(document).ready(function() {
	if (localStorage.userName != undefined) {
		$('input:text[name=username]').val(localStorage.userName);
	}
	
	if (localStorage.userInfo == undefined) {
		userInfo = userInfoDefault;
	} else {
		userInfo = JSON.parse(localStorage.userInfo);
	}
	
	$('#button-submit').click(function() {
		periodSelection = $('input:radio[name=period]:checked').val();
		var userName = $('input:text[name=username]').val();
		
		if (periodSelection == undefined || userName == '') {
			alert('Please select a pay period and enter your full name.');
		} else {
			localStorage.userName = userName;
			generate_html();
		}
	});
	
	$('#content').on('click', '#button-generate', function() {
		update_and_generate();
	});
	
	// Updates hours worked on the fly.
	$('#content').on('change', '.hour-inputs', function() {
		var textInputs = $(this).parent().parent().find('.hour-inputs');
		
		var timesArray = [];
		textInputs.each(function(index) {
			timesArray[index] = $(this).val();
		});
		
		if ($.inArray('', timesArray) == -1) {
			amPmArray = $(this).parent().parent().find('.am-pm-inputs');
			amPmArray.each(function(index) {
				timesArray[index] = timesArray[index] + ' ' + $(this).val();
			});
			
			var currDate = new Date();
			var monthIndex = currDate.getMonth();
			var year = currDate.getFullYear();
			var dayNum = parseInt($(this).parent().parent().find('#day-num').text());
			
			var hoursWorked = find_time_difference(timesArray[0], timesArray[1], dayNum, monthIndex, year);
			var hoursRested = find_time_difference(timesArray[2], timesArray[3], dayNum, monthIndex, year);
			var totalHoursWorked = hoursWorked - hoursRested;
			
			$(this).parent().parent().find('#hours-worked').text(totalHoursWorked + ' hrs');
		} else {
			$(this).parent().parent().find('#hours-worked').text(0 + ' hrs');
		}
	});
});

// Returns the difference in hours between two passed string times.
function find_time_difference(time1, time2, day, month, year) {
	// Find hour of the day and minutes of the hour for the first time.	
	var parts1 = time1.split(':');
	var hours1;
	var minutes1 = parseInt(parts1[1].split(' ')[0]);
	
	if (parts1[1].split(' ')[1] == 'am') {
		if (parseInt(parts1[0]) == 12) {
			hours1 = 0;
		} else {
			hours1 = parseInt(parts1[0]);
		}
	} else {
		if (parseInt(parts1[0]) == 12) {
			hours1 = 12;
		} else {
			hours1 = parseInt(parts1[0]) + 12;
		}
	}
	
	// Find hour of the day and minutes of the hour for the second time.
	var parts2 = time2.split(':');
	var hours2;
	var minutes2 = parseInt(parts2[1].split(' ')[0]);
	
	if (parts2[1].split(' ')[1] == 'am') {
		if (parseInt(parts2[0]) == 12) {
			hours2 = 0;
		} else {
			hours2 = parseInt(parts2[0]);
		}
	} else {
		if (parseInt(parts2[0]) == 12) {
			hours2 = 12;
		} else {
			hours2 = parseInt(parts2[0]) + 12;
		}
	}
	
	var date1 = new Date(year, month, day, hours1, minutes1);
	var date2 = new Date(year, month, day, hours2, minutes2);
	var startTime = date1.getTime();
	var endTime = date2.getTime();
	
	if (startTime > endTime) {
		alert("Warning: the entered end time occurs before the entered start time.");
	} else {
		var differenceInMills = endTime - startTime;
		var differenceInHours = differenceInMills / 1000 / 60 / 60;
		
		return Math.round(differenceInHours * 100) / 100;
	}
}

// Creates HTML needed to edit work times.
function generate_html() {
	var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	var currDate = new Date();
	var monthIndex = currDate.getMonth();
	var month = monthStrings[monthIndex];
	var year = currDate.getFullYear();
	
	// Make sure the content area is ready for new content.
	$('#content').empty();
	
	// Determine loop indices depending on what pay period was selected.
	var start, stop;
	if (periodSelection == '0') {
		start = 0;
		stop = 15;
	} else {
		// Calaculate the last day of the month in the second pay period.
		var lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate();
		
		start = 15;
		stop = lastDayOfMonth;
	}
	
	// Create HTML representing work days, and append it to the page.
	for (var i = start; i < stop; i++) {
		// Calculate needed values for the HTML to be generated.
		var tempDate = new Date(year, monthIndex, i + 1);
		var tempDay = tempDate.getDay();
		var day = dayNames[tempDay];
		var dayNum = i + 1;
		
		var workDayLine;
		if (userInfo[day][4] == '1') {
			// Calculate how many hours were worked.
			var shiftStartFull = userInfo[day][0];
			var shiftEndFull = userInfo[day][1];
			var breakStartFull = userInfo[day][2];
			var breakEndFull = userInfo[day][3];
			
			var hoursWorked = find_time_difference(shiftStartFull, shiftEndFull, dayNum, monthIndex, year);
			var hoursRested = find_time_difference(breakStartFull, breakEndFull, dayNum, monthIndex, year);
			var totalHoursWorked = hoursWorked - hoursRested;
			
			// Get currently stored values for shift and break start and end times.
			var shiftStart = userInfo[day][0].split(' ')[0];
			var shiftStartAmPm = userInfo[day][0].split(' ')[1];
			var shiftStartAmPmArray = ['am', 'pm'];
			var shiftStartAmPm = shiftStartAmPmArray.splice(shiftStartAmPmArray.indexOf(shiftStartAmPm), 1)[0];
			var shiftStartAmPmAlt = shiftStartAmPmArray[0];
			
			var shiftEnd = userInfo[day][1].split(' ')[0];
			var shiftEndAmPm = userInfo[day][1].split(' ')[1];
			var shiftEndAmPmArray = ['am', 'pm'];
			var shiftEndAmPm = shiftEndAmPmArray.splice(shiftEndAmPmArray.indexOf(shiftEndAmPm), 1)[0];
			var shiftEndAmPmAlt = shiftEndAmPmArray[0];
			
			var breakStart = userInfo[day][2].split(' ')[0];
			var breakStartAmPm = userInfo[day][2].split(' ')[1];
			var breakStartAmPmArray = ['am', 'pm'];
			var breakStartAmPm = breakStartAmPmArray.splice(breakStartAmPmArray.indexOf(breakStartAmPm), 1)[0];
			var breakStartAmPmAlt = breakStartAmPmArray[0];
			
			var breakEnd = userInfo[day][3].split(' ')[0];
			var breakEndAmPm = userInfo[day][3].split(' ')[1];
			var breakEndAmPmArray = ['am', 'pm'];
			var breakEndAmPm = breakEndAmPmArray.splice(breakEndAmPmArray.indexOf(breakEndAmPm), 1)[0];
			var breakEndAmPmAlt = breakEndAmPmArray[0];
			
			// Create and append lines of HTML representing work days.
			workDayLine = $('<div class="day-line">' +
			                    '<div class="date-box">' +
				    	  	        '<span id="day">' + day + '</span><span class="no-margin">, </span>' +
						            '<span id="month">' + month + '</span>' +
						            '<span id="day-num">' + dayNum + '</span><span class="no-margin"> - </span>' +
						            '<span id="hours-worked" class="hours-group">' + totalHoursWorked + ' hrs </span></div>' +
						        '<span><input class="hour-inputs" type="text" value="' + shiftStart + '"></span>' +
						        '<span><select name="am-pm" class="am-pm-inputs">' +
							        '<option value="' + shiftStartAmPm + '">' + shiftStartAmPm + '</option>' +
							        '<option value="' + shiftStartAmPmAlt + '">' + shiftStartAmPmAlt + '</option></select></span>' +
						        '<span><input class="hour-inputs" type="text" value="' + shiftEnd + '"></span>' +
						        '<span><select name="am-pm" class="am-pm-inputs">' +
							        '<option value="' + shiftEndAmPm + '">' + shiftEndAmPm + '</option>' +
							        '<option value="' + shiftEndAmPmAlt + '">' + shiftEndAmPmAlt + '</option></select></span>' +
						        '<span><input class="hour-inputs" type="text" value="' + breakStart + '"></span>' +
						        '<span><select name="am-pm" class="am-pm-inputs">' +
							        '<option value="' + breakStartAmPm + '">' + breakStartAmPm + '</option>' +
							        '<option value="' + breakStartAmPmAlt + '">' + breakStartAmPmAlt + '</option></select></span>' +
						        '<span><input class="hour-inputs" type="text" value="' + breakEnd + '"></span>' +
						        '<span><select name="am-pm" class="am-pm-inputs">' +
							        '<option value="' + breakEndAmPm + '">' + breakEndAmPm + '</option>' +
							        '<option value="' + breakEndAmPmAlt + '">' + breakEndAmPmAlt + '</option></select></span></div>');
		} else {
			workDayLine = $('<div class="day-line">' +
			                    '<div class="date-box">' +
				    	  	        '<span id="day">' + day + '</span><span class="no-margin">, </span>' +
						            '<span id="month">' + month + '</span>' +
						            '<span id="day-num">' + dayNum + '</span><span class="no-margin"> - </span>' +
						            '<span id="hours-worked" class="hours-group">0 hrs </span></div>' +
						        '<span><input class="hour-inputs" type="text"></span>' +
						        '<span><select name="am-pm" class="am-pm-inputs">' +
							        '<option value="am">am</option>' +
							        '<option value="pm">pm</option></select></span>' +
						        '<span><input class="hour-inputs" type="text"></span>' +
						        '<span><select name="am-pm" class="am-pm-inputs">' +
							        '<option value="pm">pm</option>' +
							        '<option value="am">am</option></select></span>' +
						        '<span><input class="hour-inputs" type="text"></span>' +
						        '<span><select name="am-pm" class="am-pm-inputs">' +
							        '<option value="pm">pm</option>' +
							        '<option value="am">am</option></select></span>' +
						        '<span><input class="hour-inputs" type="text"></span>' +
						        '<span><select name="am-pm" class="am-pm-inputs">' +
							        '<option value="pm">pm</option>' +
							        '<option value="am">am</option></select></span></div>');
		}
		
		$('#content').append(workDayLine);
	}
	
	// Append a submit button.
	var submitButton = $('<div id="button-generate">generate sheet</div>');
	$('#content').append(submitButton);
}

// Stores some of the values entered and generates the timesheet.
function update_and_generate() {
	var lineText = '';
	var currDate = new Date();
	var monthIndex = currDate.getMonth();
	var year = currDate.getFullYear();
	var month = monthStrings[monthIndex];
	
	// Output the timesheet in plain text.
	$('.day-line').each(function(index1) {
		var day = $(this).find('#day').text();
		var dayNumString = $(this).find('#day-num').text();
		var dayNum = parseInt(dayNumString);
		var timesText = ' ';
		
		// Pad the day of the month with a leading zero if it's a single digit.
		if (dayNumString.length == 1) {
			dayNumString = '0' + dayNum.toString();
		}
		
		if (parseInt($(this).find('#hours-worked').text()) > 0) {
			var lineDropdowns = $(this).find('.am-pm-inputs');
			var shiftStartFull, shiftEndFull, breakStartFull, breakEndFull;
			
			$(this).find('input').each(function(index2) {
				var value = $(this).val();
				var amPm = $(lineDropdowns.get(index2)).val();
				
				if (index2 == 0) {
					// Add shift start time.
					shiftStartFull = value + ' ' + amPm;
					timesText = shiftStartFull;
				} else if (index2 == 1) {
					// Add shift end time.
					shiftEndFull = value + ' ' + amPm;
					timesText += ' - ' + shiftEndFull;
				} else if (index2 == 2) {
					// Add break start time.
					breakStartFull = value + ' ' + amPm;
					timesText += ' (break ' + breakStartFull;
				} else {
					// Add break end time.
					breakEndFull = value + ' ' + amPm;
					timesText += ' - ' + breakEndFull + ')';
				}
			});
			
			// Recalculate how many hours were worked.
			var hoursWorked = find_time_difference(shiftStartFull, shiftEndFull, dayNum, monthIndex, year);
			var hoursRested = find_time_difference(breakStartFull, breakEndFull, dayNum, monthIndex, year);
			var totalHours = hoursWorked - hoursRested;
			
			// Build some plain text here.
			lineText += day + ' ' + month + ' ' + dayNumString + ' - ' + totalHours + ' hrs, ' + timesText + '<br>';
		} else {
			// Build some plain text here.
			lineText += day + ' ' + month + ' ' + dayNumString + ' - 0 hrs<br>';
		}
		
		// Update the global variable that holds the user's time preferences with values from the first 7 days of the timesheet.
		if (index1 < 7) {
			if (parseInt($(this).find('#hours-worked').text()) > 0) {
				userInfo[day][0] = shiftStartFull;
				userInfo[day][1] = shiftEndFull;
				userInfo[day][2] = breakStartFull;
				userInfo[day][3] = breakEndFull;
				userInfo[day][4] = '1';
			} else {
				userInfo[day][0] = '0:00 --';
				userInfo[day][1] = '0:00 --';
				userInfo[day][2] = '0:00 --';
				userInfo[day][3] = '0:00 --';
				userInfo[day][4] = '0';
			}
		}
	});
	
	// Determine beginning and ending days of the pay period.
	var beginning, end;
	if (periodSelection == '0') {
		beginning = 1;
		end = 15;
	} else {
		// Calaculate the last day of the month in the second pay period.
		var lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate();
		
		beginning = 15;
		end = lastDayOfMonth;
	}
	
	// Pad the day of the month with a leading zero if it's a single digit.
	if (beginning.toString().length == 1) {
		beginning = '0' + beginning.toString();
	}
	
	// Pad the the month with a leading zero if it's a single digit.
	var tempMonth = monthIndex + 1;
	if (tempMonth.toString().length == 1) {
		tempMonth = '0' + tempMonth.toString();
	}
	
	// Build email subject line plain text.
	var dateStart = tempMonth + '/' + beginning + '/' + year.toString().slice(2);
	var dateEnd = tempMonth + '/' + end + '/' + year.toString().slice(2);
	var subjectLine = localStorage.userName + ' timesheet, pay period ' + dateStart + ' - ' + dateEnd;
	
	// Build timesheet header plain text.
	var header = 'TIME SHEET for ' + localStorage.userName + '<br><br>' +
		         'CURRENT pay period: ' + month + ' ' + beginning +
		         ', ' + year + ' - ' + month + ' ' + end + ', ' + year + '<br><br>' +
		         'Record HOURS WORKED and/or ATTENDANCE CODES<br>' +
		         '(including start times, end times, and break periods)<br><br>';
	
	// Build timesheet hour totals.
	var hoursAdded = 0;
	$('#content').find('.hours-group').each(function(index) {
		hoursAdded += parseInt($(this).text());
	});
	
	var hourTotals = '<br>Totals<br>' + hoursAdded + ' hrs regular<br>' +
			         '0 hrs PTO<br>' +
			         '0 hrs OT<br>' +
			         '0 hrs H<br><br>';
	
	// Update local storage (the "database") with values from the updated global variable.
	localStorage.userInfo = JSON.stringify(userInfo);
	
	// Print out all the plain text of the timesheet.
	$('#content').empty();
	$('#content').css('font-family', 'Courier');
	$('#content').append('<span class="mini-headers">email subject line</span><span>:</span><br><br>');
	$('#content').append(subjectLine);
	$('#content').append('<br><br><span class="mini-headers">timesheet</span><span>:</span><br><br>');
	$('#content').append(header);
	$('#content').append(lineText);
	$('#content').append(hourTotals);
	// $('#content').append(footer);
}