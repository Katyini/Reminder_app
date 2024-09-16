const client = ZAFClient.init();
client.invoke("resize", { width: "380px", height: "376px" });

///FOR DEFAULT BEHAVIOUR OF POPUP WINDOW
async function popUp() {
  //console.log("check3");
  var topBarClientPromise = client
    .get("instances")
    .then(function (instancesData) {
      var instances = instancesData.instances;
      for (var instanceGuid in instances) {
        if (instances[instanceGuid].location === "top_bar") {
          return client.instance(instanceGuid);
        }
      }
    });
  topBarClientPromise.then(function (topBarClient) {
    topBarClient.invoke("popover");
  });
}
var overdueSectionForSupervisor = document.getElementById(
  "overdueSectionForSupervisor"
);
overdueSectionForSupervisor.style.display = "none";
// client.on('app.registered', function appRegistered(e) {
//     console.log(e,"e")
//   });

//   client.has('app.registered', appRegistered); // true

//   client.invoke('popover', 'toggle')
///USING THIS WE CAN SEPARATELY SET HEIGHT AND WIDTH OF POPUP WINDOW BUT IT HAS LIMITATION THAT WE CAN"T EXCEED MORE THAN X HEIGHT
// client.invoke('popover', {
//     width: 400, // The special value auto is also allowed for the height property only
//     height: 300
//   })

//   instanceClient.invoke('preloadPane')

var time = document.getElementById("time");
var date = document.getElementById("date");
var SupervisorSection = document.getElementById("SupervisorSection");
SupervisorSection.style.display = "none";

var ticketId;
client
  .get("ticket.id")
  .then((data) => {
    ticketId = data["ticket.id"];
  })
  .catch((error) => {
    // console.error("Error retrieving ticket ID:", error);
  });

function findValueById(idToFind, customFields) {
  for (const obj of customFields) {
    if (obj.id === idToFind) {
      return obj.value;
    }
  }
  // If the id is not found, you can return a default value or null, for example:
  return null;
}

var message = document.getElementById("message");
function renderValue() {
  var rem = document.getElementById("rem");
  rem.innerHTML = `<h5>Your reminder is getting set..</h5> `;
  rem.style.display = "block";

  setTimeout(() => {
    rem.innerHTML = `<h5>Reminder Set Successfully</h5>`;
  }, 10000);

  setTimeout(() => {
    rem.style.display = "none";
  }, 13000);

  let now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so we add 1 and pad with '0' if needed.
  const day = String(now.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  let nowTime = `${hours}:${minutes}:${seconds}`;

  if (date.value == "") {
    date.value = formattedDate;
  }

  var selectedIndex = message.selectedIndex;
  if (selectedIndex !== -1) {
    // Ensure an option is selected
    var selectedOption = message.options[selectedIndex];
    var valueofMessage = selectedOption.innerHTML;
  }

  setReminder(nowTime, time.value, ticketId, formattedDate, valueofMessage);
}
// async function updateData(){
//     let payload = {
//         ticket: {
//             custom_fields: [{ id: 19438938569233, value: "1" }, DONE
//             { id: 19438912991889, value: "2" },DONE
//             { id: 19438865358609, value: false }, DONE
//             { id: 19438916224529, value: "4" }, DONE
//             { id: 19438958642449, value: "4" } DONE
//             ]
//         },
//     };

//     await client.request({
//             url: `/api/v2/tickets/${ticketId}.json`,
//             method: "PUT",
//             contentType: "application/json",
//             data: JSON.stringify(payload),
//         })

//         .then(function (response) {
//             // searchTickets();
//         })

// }
var userCustomRoleID;
var Userid;
var defaultGroupId;
async function selfUserID() {
  var config = {
    method: "GET",
    url: "https://jubilantfoodworks7134.zendesk.com/api/v2/users/me",
    headers: {
      "Content-Type": "application/json",
    },
  };

  await client
    .request(config)

    .then(async function (response) {
      //console.log(response, "self");
      Userid = response.user.id;
      userCustomRoleID = response.user.custom_role_id;
      var groupConfig = {
        method: "GET",
        url: `https://jubilantfoodworks7134.zendesk.com/api/v2/users/${response.user.id}/group_memberships`,
        headers: {
          "Content-Type": "application/json",
        },
      };

      await client.request(groupConfig).then(function (response) {
        if (response.group_memberships[1] != undefined) {
          defaultGroupId = response.group_memberships[1].group_id;
        } else {
          defaultGroupId = response.group_memberships[0].group_id;
        }
      });
    });
}

setTimeout(selfUserID, 1000);

var tbody = document.getElementById("tbody");
function timeToSeconds(time) {
  let concatinatingSeconds = `${time}:00`;
  let [hours, minutes, seconds] = concatinatingSeconds.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

function secondsToTime(seconds) {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  let remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}
function processTime(timeStr) {
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);

  let processedHours = hours;
  let processedMinutes = minutes;
  let processedSeconds = seconds;

  if (hours < 0 || minutes < 0 || seconds <= 0) {
    processedHours = Math.max(0, hours);
    processedMinutes = Math.max(0, minutes);
    processedSeconds = Math.max(0, seconds);
  } else if (hours === 0 && minutes < 0) {
    processedMinutes = 0;
  }

  const processedTime = `${String(processedHours).padStart(2, "0")}:${String(
    processedMinutes
  ).padStart(2, "0")}:${String(processedSeconds).padStart(2, "0")}`;
  return processedTime;
}

function formatTime(seconds) {
  let days = Math.floor(seconds / (24 * 3600));
  seconds %= 24 * 3600;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  if (days == 0) {
    days = "";
  } else {
    days = `${days}d`;
  }

  return `${days} ${hours}h ${minutes}m ${seconds}s`;
}

function updateTimeAndCount(formattingTime, count) {
  // Parse the time components
  var timeComponents = formattingTime.split(" ");

  // Calculate the total time in seconds
  var totalSeconds = 0;
  for (var i = 0; i < timeComponents.length; i++) {
    var component = timeComponents[i];
    if (component.endsWith("h")) {
      totalSeconds += parseInt(component) * 3600;
    } else if (component.endsWith("m")) {
      totalSeconds += parseInt(component) * 60;
    } else if (component.endsWith("s")) {
      totalSeconds += parseInt(component);
    }
  }

  // Check if the time is less than 1 hour (3600 seconds)
  if (totalSeconds < 3600 && totalSeconds > 0) {
    count = 1;
  } else {
    count = 0;
  }

  return count;
}
var appendOverdueSectionData = document.getElementById(
  "appendOverdueSectionData"
);
var upcomingNotificationsount = 0;
async function searchTickets() {
  // USER ID
  var UserID = Userid;

  // CALLING SEARCH API FOR GETTING LOGGED IN USER DATA
  var notificationCount = 0;

  const params = {
    query: `assignee:${UserID}`,
  };

  var subdomain = "jubilantfoodworks7134";
  const url = `https://${subdomain}.zendesk.com/api/v2/search?query=${params.query}`;
  var settings = {
    url: url,
    type: "GET",
    dataType: "json",
  };

  client.request(settings).then(
    async function (data) {
      //console.log(data, "data");
      tbody.innerHTML = "";

      for (let i = 0; i < data.results.length; i++) {
        // if (data.results[i].status != "closed"){
        //     console.log(data.results[i],"data")
        //     }
        // FINDING VALUES OF REMINDER TIME AND REMINDER SUBMIT TIME
        var checkingTime = 0;
        let x = findValueById(19438916224529, data.results[i].custom_fields);
        let y = findValueById(19438938569233, data.results[i].custom_fields);

        let xSeconds = timeToSeconds(x);
        let ySeconds = timeToSeconds(y);

        // NEED TO OPTIMIZE THIS CONDITION FOR THE DATES NOT EQUAL TO TODAY
        if (x != null && y != null) {
          let differenceSeconds = ySeconds - xSeconds;
          let differenceTime = secondsToTime(differenceSeconds);
          let res = updateTime(
            secondsToTime(ySeconds),
            secondsToTime(xSeconds),
            differenceTime,
            findValueById(19438912991889, data.results[i].custom_fields)
          );
          if (res == 0) {
            // CHECKING IS TIME VALUE IS 0

            res = "00:00:00";
          } else {
            const inputTime = res;
            const parts = inputTime.split(":");

            const hours = parts[0].padStart(2, "0");
            const minutes = parts[1].padStart(2, "0");
            const seconds = parts[2];

            const formattedTime = `${hours}:${minutes}:${seconds}`;
            res = formattedTime;
          }

          res = processTime(res);
          let formatting = timeToSeconds(res);
          let formattingTime = formatTime(formatting);

          count = updateTimeAndCount(formattingTime, notificationCount);
          if (count == 1) {
            notificationCount++;
          }

          let link =
            "https://jubilantfoodworks7134.zendesk.com/agent/tickets/" +
            data.results[i].id;

          if (formatting == 0) {
            checkingTime = 1;
          }
          if (formatting <= 10 && formatting >= 2) {
            let dataID = data.results[i].id;
            await setReminderToTrue(dataID);

            await overdueReminders(data);
            setTimeout(popUp, 4000);
          }

          var checkingNaN = 1;
          if (isNaN(differenceSeconds)) {
            checkingNaN = 0;
          }

          if (checkingTime == 0) {
            let message = findValueById(
              19438958642449,
              data.results[i].custom_fields
            );
            // setTimeLeftFieldData(formattingTime, data.results[i].id)

            tbody.innerHTML += ` <tr>
            <td onclick="window.open('${link}', '_blank')" class="pointer">${data.results[i].id}</td>
            <td>${message}</td>
            <td>${formattingTime}</td>
            
            
          </tr>
            `;
          }
        }
      }
    },
    function (response) {
      //console.error(response);
    }
  );
}
setInterval(searchTickets, 9000);
setTimeout(searchTickets, 4000);
function timeDifference(time1, time2, date) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;

  const dateDifference = Date.parse(date) - Date.parse(formattedDate);
  const daysDifference = dateDifference / (24 * 60 * 60 * 1000); // Convert to days

  if (daysDifference >= 0) {
    const [h1, m1, s1] = time1.split(":").map(Number);
    const [h2, m2, s2] = time2.split(":").map(Number);

    const totalSeconds1 = h1 * 3600 + m1 * 60 + s1;
    const totalSeconds2 = h2 * 3600 + m2 * 60 + s2;

    const differenceInSeconds =
      totalSeconds1 - totalSeconds2 + daysDifference * 24 * 3600;

    const hours = Math.floor(differenceInSeconds / 3600);
    const minutes = Math.floor((differenceInSeconds % 3600) / 60);
    const seconds = differenceInSeconds % 60;

    return `${hours}:${minutes}:${seconds}`;
  } else {
    return 0;
  }
}

function updateTime(x, y, z, date) {
  let now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  let nowTime = `${hours}:${minutes}:${seconds}`;
  let result = timeDifference(String(x), String(nowTime), date);
  return result;
}
///CALL THIS FUNCTION ONLY FOR CREATING FIELDS
function createFields() {
  ///FOR EG - CREATING AGE FIELD
  const data = {
    ticket_field: {
      type: "text",
      title: "Age",
    },
  };
  var subdomain = "jubilantfoodworks7134";

  client
    .request({
      url: `https://${subdomain}.zendesk.com/api/v2/ticket_fields.json`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
    })

    .then(function (response) {
      //console.log("Custom field created successfully.", response);
    })

    .catch(function (error) {
      //console.error("Failed to create the custom field.");
      //console.error("Error:", error);
    });
}

var preferCount = 0;
var dataToPassinOverdueFunc;
var showing24hoursgapReminder = document.getElementById(
  "showing24hoursgapReminder"
);
async function showPrefferedTime() {
  var preferredTimeSection = document.getElementById("preferredTimeSection");
  let UserID;
  var config = {
    method: "GET",
    url: "https://jubilantfoodworks7134.zendesk.com/api/v2/users/me",
    headers: {
      "Content-Type": "application/json",
    },
  };

  await client.request(config).then(function (response) {
    UserID = response.user.id;
  });

  const params = {
    query: `assignee:${UserID}`,
  };

  var subdomain = "jubilantfoodworks7134";
  const url = `https://${subdomain}.zendesk.com/api/v2/search?query=${params.query}`;
  var settings = {
    url: url,
    type: "GET",
    dataType: "json",
  };

  await client.request(settings).then(async function (data) {
    dataToPassinOverdueFunc = data;
    // commented for now
    await overdueReminders(data);
    for (let i = 0; i < data.results.length; i++) {
      let preferredTimeValue = findValueById(
        18761752103953,
        data.results[i].custom_fields
      );
      // let x = findValueById(19438916224529, data.results[i].custom_fields);
      // let y = findValueById(19438938569233, data.results[i].custom_fields);

      for (let j = 0; j <= data.results[i].tags.length; j++) {
        //console.log(data, "datatochek");
        let link =
          "https://jubilantfoodworks7134.zendesk.com/agent/tickets/" +
          data.results[i].id;
        //console.log(data.results[i].tags[j], "alltags");
        if (
          data.results[i].tags[j] == "remind1" &&
          data.results[i].status != "closed"
        ) {
          popUp();
          showing24hoursgapReminder.innerHTML += `<div class="24hoursReminders"><h3>Notification-</h3>
                        It's been 24 hours since the ticket number :<span onclick="window.open('${link}', '_blank')" class="pointer">${data.results[i].id}</span><br/> is on the pending state <i class="material-icons" style="color:red;padding-left:7%;cursor:pointer">Okay</i></div>`;
        }
        if (
          data.results[i].tags[j] == "remind2" &&
          data.results[i].status != "closed"
        ) {
          popUp();
          showing24hoursgapReminder.innerHTML += `<div class="48hoursReminders"><h3>Notification-</h3>
                        It's been 48 hours since the ticket number :<span onclick="window.open('${link}', '_blank')" class="pointer">  ${data.results[i].id}</span>  <br/> is on the pending state <i class="material-icons 48hours" style="color:red;padding-left:7%;cursor:pointer">Okay</i></div>`;
        }
      }
      console.log(preferredTimeValue, "preferredTimeValue");
      if (preferredTimeValue != null) {
        var timeSlotVariable = preferredTimeValue;

        var timeSlotParts = timeSlotVariable.split("-");
        var startTimeHours = timeSlotParts[0];
        var endTimeHours = timeSlotParts[1];
        startTimeHours = convertTo24HourFormat(startTimeHours);
        let passstarttime = `${startTimeHours}:00:00`;
        endTimeHours = convertTo24HourFormat(endTimeHours);
        let passendTime = `${endTimeHours}:00`;

        const currentTime = new Date();
        const currentHours = currentTime.getHours();

        //console.log(data.results[i], "resul");
        // Check if the current time is within one hour of the start time
        if (
          currentHours > startTimeHours - 1 &&
          currentHours < endTimeHours &&
          data.results[i].status != "closed"
        ) {
          setReminder(
            passstarttime,
            passendTime,
            data.results[i].id,
            null,
            null
          );

          let link =
            "https://jubilantfoodworks7134.zendesk.com/agent/tickets/" +
            data.results[i].id;
          preferredTimeSection.innerHTML += ` <tr>
                    <th scope="row">${preferCount + 1}</th>
                    <td onclick="window.open('${link}', '_blank')" class="pointer">${
            data.results[i].id
          }</td>
                    <td>${timeSlotVariable}</td>
                    
                  </tr>
                  `;
          preferCount++;
        }
      }
    }
  });
}
showPrefferedTime();
function overdueReminders(data) {
  //console.log("check2");
  return new Promise((resolve, reject) => {
    appendOverdueSectionData.innerHTML = "";
    if (data != undefined) {
      for (let i = 0; i < data.results.length; i++) {
        let message = findValueById(
          19438958642449,
          data.results[i].custom_fields
        );
        let isReminder = findValueById(
          19438865358609,
          data.results[i].custom_fields
        );
        if (isReminder && data.results[i].status != "closed") {
          //console.log(data.results[i], "ABCDEF");
          let link =
            "https://jubilantfoodworks7134.zendesk.com/agent/tickets/" +
            data.results[i].id;
          appendOverdueSectionData.innerHTML += `
                    <tr>
                    <td onclick="window.open('${link}', '_blank')" class="pointer" style="padding-left:2%">${data.results[i].id}</td>
                    <td>${message}</td>
                    <td class= "delete" style="cursor:pointer"><i class="material-icons" style="color:red;padding-left:3%">delete</i></td>
                    </tr>
                    `;
        }
      }
      resolve(true);
    }
  });
}

// overdueReminders()
// setTimeout(overdueReminders(data),1000);

function convertTo24HourFormat(time12Hour) {
  const time = time12Hour.replace(/[^0-9]/g, ""); // Remove non-numeric characters

  let hours = parseInt(time, 10);

  if (time12Hour.toLowerCase().includes("pm") && hours !== 12) {
    hours += 12;
  } else if (time12Hour.toLowerCase().includes("am") && hours === 12) {
    hours = 0;
  }

  // Ensure the hours are formatted with leading zeros if needed
  const formattedHours = String(hours).padStart(2, "0");

  return `${formattedHours}`;
}
function setReminder(nowTime, endtime, id, ComingDate, message) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so we add 1 and pad with '0' if needed.
  const day = String(now.getDate()).padStart(2, "0");
  let formattedDate = `${year}-${month}-${day}`;
  if (ComingDate != null) {
    formattedDate = ComingDate;
  }
  let messageValue = "Pending Form";
  if (message == null) {
    message = messageValue;
  }
  var payload = {
    ticket: {
      custom_fields: [
        { id: 19438938569233, value: endtime },
        { id: 19438912991889, value: formattedDate },
        { id: 19438865358609, value: false },
        { id: 19438916224529, value: nowTime },
        { id: 19438958642449, value: message },
      ],
    },
  };

  client
    .request({
      url: `/api/v2/tickets/${id}.json`,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify(payload),
    })

    .then(function (response) {
      searchTickets();
    })

    .catch(function (error) {
      console.error("Failed to update the custom field.");
      console.error("Error:", error);
    });
}

function delete24HoursReminder() {
  var TwentyFourHoursReminders =
    document.getElementsByClassName("24hoursReminders");
  var okayButton = document.getElementsByClassName("material-icons");
  //console.log(okayButton, "24");
  for (let i = 0; i < TwentyFourHoursReminders.length; i++) {
    okayButton[i].addEventListener("click", async () => {
      //console.log(okayButton[i].parentNode.childNodes);
      var textToTrim = okayButton[i].parentNode.childNodes[2].innerHTML;
      // console.log(textToTrim,typeof textToTrim,"printing")
      // var parts = textToTrim.split(':');
      // var ticketNumber = parts[1].trim();
      var data = {
        tags: ["remind1"],
      };
      var config = {
        method: "DELETE",
        url: `https://jubilantfoodworks7134.zendesk.com/api/v2/tickets/${textToTrim}/tags.json`,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(data),
      };

      await client
        .request(config)
        .then(function (response) {
          //console.log(response, "tagResponse");
          okayButton[i].parentNode.innerHTML = "";
        })

        .catch(function (error) {
          //console.error("Failed to update the custom field.");
          //console.error("Error:", error);
        });
    });
  }
}
function delete48HoursReminder() {
  var TwentyFourHoursReminders =
    document.getElementsByClassName("48hoursReminders");
  var okayButton = document.getElementsByClassName("48hours");
  //console.log(okayButton, "24");
  for (let i = 0; i < TwentyFourHoursReminders.length; i++) {
    okayButton[i].addEventListener("click", async () => {
      //console.log("Hi");
      //console.log(okayButton[i].parentNode.childNodes);
      var textToTrim = okayButton[i].parentNode.childNodes[2].innerHTML;
      // console.log(textToTrim,typeof textToTrim,"printing")
      // var parts = textToTrim.split(':');
      // var ticketNumber = parts[1].trim();
      var data = {
        tags: ["remind2"],
      };
      var config = {
        method: "DELETE",
        url: `https://jubilantfoodworks7134.zendesk.com/api/v2/tickets/${textToTrim}/tags.json`,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(data),
      };

      await client
        .request(config)
        .then(function (response) {
          //console.log(config, "config", ticketNumber);
          //console.log(response, "tagResponse");
          okayButton[i].parentNode.innerHTML = "";
        })

        .catch(function (error) {
          //console.error("Failed to update the custom field.");
          //console.error("Error:", error);
        });
    });
  }
}
setTimeout(delete24HoursReminder, 2000);
setTimeout(delete48HoursReminder, 2000);

async function deleteOverdueRecord() {
  var deleteRecord = document.getElementsByClassName("delete");
  var del = document.querySelectorAll(".delete");
  for (let i = 0; i < deleteRecord.length; i++) {
    deleteRecord[i].addEventListener("click", async () => {
      const table = deleteRecord[i].parentNode.parentNode;
      const row = deleteRecord[i].parentNode;
      let ticketId = deleteRecord[i].parentNode.childNodes[1].innerHTML;
      table.removeChild(row);
      await setReminderToFalse(ticketId);
    });
  }
}

setTimeout(deleteOverdueRecord, 2000);
// async function setTimeLeftFieldData(timeLeft, ticketID) {
//     setTimeout(async()=>{
//     var payload = {
//         ticket: {
//             custom_fields: [
//                 { id: 19092257553553, value: timeLeft }
//             ]
//         },
//     };

//     await client
//         .request({
//             url: `/api/v2/tickets/${ticketID}.json`,
//             method: "PUT",
//             contentType: "application/json",
//             data: JSON.stringify(payload),
//         })

//         .then(function (response) {
//             console.log("SetTimerResponse", response);

//         })

//         .catch(function (error) {
//             console.error("Failed to update the custom field.");
//             console.error("Error:", error);
//         });
//     },30000)
// }
async function setReminderToFalse(ticketID) {
  var payload = {
    ticket: {
      custom_fields: [{ id: 19438865358609, value: false }],
    },
  };

  await client
    .request({
      url: `/api/v2/tickets/${ticketID}.json`,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify(payload),
    })

    .then(function (response) {})

    .catch(function (error) {
      //console.error("Failed to update the custom field.");
      //console.error("Error:", error);
    });
}

function setReminderToTrue(ticketID) {
  var payload = {
    ticket: {
      custom_fields: [{ id: 19438865358609, value: true }],
    },
  };

  return new Promise(async (resolve, reject) => {
    await client
      .request({
        url: `/api/v2/tickets/${ticketID}.json`,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify(payload),
      })

      .then(async function (response) {
        resolve(true);
      })

      .catch(function (error) {
        console.error("Failed to update the custom field.");
        console.error("Error:", error);
        reject(false);
      });
  });
}
var divToDisplayNone = document.getElementsByClassName("divToDisplayNone");
function getSupervisorData() {
  var roles = [
    { 17581657858321: "BE Agent" },
    { 18797048675473: "BE Supervisor - 1" },
    { 18797078653713: "BE Supervisor - 2" },
  ];

  var matchingField = null;

  for (var i = 0; i < roles.length; i++) {
    var roleObject = roles[i];
    var keys = Object.keys(roleObject);
    // HERE userCustomRoleID we are fetching from the current logged in user
    if (keys.some((key) => Number(key) === userCustomRoleID)) {
      matchingField = roleObject[userCustomRoleID];
      break;
    }
  }
  //console.log(defaultGroupId, "defaultGrouPId");
  var overdueSection = document.getElementById("overdueSection");
  var accordionExample = document.getElementById("accordionExample");
  if (userCustomRoleID !== 17581657858321 && matchingField != null) {
    //console.log(ticketId, "ticketIDD");
    accordionExample.style.display = "none";
    overdueSection.style.display = "block";
    overdueSectionForSupervisor.style.display = "block";
    divToDisplayNone[0].style.display = "none";
    const subdomain = "jubilantfoodworks7134";
    const groupID = defaultGroupId; //

    const url = `https://${subdomain}.zendesk.com/api/v2/users/search.json?query=group_id:${groupID}`;
    const settings = {
      url: url,
      type: "GET",
      dataType: "json",
    };

    client
      .request(settings)
      .then(function (data) {
        for (let i = 0; i < data.users.length; i++) {
          getFieldsOfAllAgents(data.users[i].id, data.users[i].custom_role_id);
          if (i == data.users.length - 1) {
            // overdueSection.style.display = 'none'
            SupervisorSection.style.display = "block";
          }
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  }
}
setTimeout(getSupervisorData, 2000);

var appendOverdueSupervisorSectionData = document.getElementById(
  "appendOverdueSupervisorSectionData"
);
async function getFieldsOfAllAgents(userID, userCustomRoleID) {
  var roles = [
    { 17581657858321: "BE Agent" },
    { 18797048675473: "BE Supervisor - 1" },
    { 18797078653713: "BE Supervisor - 2" },
  ];

  var matchingField = null;

  for (var i = 0; i < roles.length; i++) {
    var roleObject = roles[i];
    var keys = Object.keys(roleObject);

    if (keys.some((key) => Number(key) === userCustomRoleID)) {
      matchingField = roleObject[userCustomRoleID];
      break;
    }
  }
  var appendSupervisorSectionData = document.getElementById(
    "appendSupervisorSectionData"
  );
  if (matchingField === "BE Agent") {
    const params = {
      query: `assignee:${userID}`,
    };

    var subdomain = "jubilantfoodworks7134";
    const url = `https://${subdomain}.zendesk.com/api/v2/search?query=${params.query}`;
    var settings = {
      url: url,
      type: "GET",
      dataType: "json",
    };

    await client.request(settings).then(async function (data) {
      for (let i = 0; i < data.results.length; i++) {
        let isReminder = findValueById(
          19438865358609,
          data.results[i].custom_fields
        );
        if (
          isReminder &&
          isReminder != null &&
          data.results[i].status != "closed"
        ) {
          var nameToRender;

          var subdomain = "jubilantfoodworks7134";
          const url = `https://${subdomain}.zendesk.com/api/v2/users/${data.results[i].assignee_id}`;
          var settings = {
            url: url,
            type: "GET",
            dataType: "json",
          };

          await client.request(settings).then(function (data) {
            nameToRender = data.user.name;
          });

          //console.log(data.results[i], "ABCDEFG");
          let ticketLink =
            "https://jubilantfoodworks7134.zendesk.com/agent/tickets/" +
            data.results[i].id;
          appendOverdueSupervisorSectionData.innerHTML += `
                <tr>
                <td onclick="window.open('${ticketLink}', '_blank')" class="pointer" style="padding-left:7%"><b>${data.results[i].id}</b></td>
                <td>${nameToRender}</td>
                </tr>
                `;
        }

        // let timeLeft = findValueById(19092257553553, data.results[i].custom_fields);
        var checkingTime = 0;
        let x = findValueById(19438916224529, data.results[i].custom_fields);
        let y = findValueById(19438938569233, data.results[i].custom_fields);

        let xSeconds = timeToSeconds(x);
        let ySeconds = timeToSeconds(y);

        // NEED TO OPTIMIZE THIS CONDITION FOR THE DATES NOT EQUAL TO TODAY
        if (x != null && y != null) {
          let differenceSeconds = ySeconds - xSeconds;
          let differenceTime = secondsToTime(differenceSeconds);

          let res = updateTime(
            secondsToTime(ySeconds),
            secondsToTime(xSeconds),
            differenceTime,
            findValueById(19438912991889, data.results[i].custom_fields)
          );
          //console.log(res, "differenceSeconds");
          if (res == 0) {
            // CHECKING IS TIME VALUE IS 0

            res = "00:00:00";
          } else {
            const inputTime = res;
            const parts = inputTime.split(":");

            const hours = parts[0].padStart(2, "0");
            const minutes = parts[1].padStart(2, "0");
            const seconds = parts[2];

            const formattedTime = `${hours}:${minutes}:${seconds}`;
            res = formattedTime;
          }

          res = processTime(res);
          let formatting = timeToSeconds(res);
          let formattingTime = formatTime(formatting);

          if (formatting == 0) {
            checkingTime = 1;
          }
          var checkingNaN = 1;
          if (isNaN(differenceSeconds)) {
            checkingNaN = 0;
          }
          //console.log(data.results[i], "123");
          if (checkingTime == 0) {
            var nameToRender;

            var subdomain = "jubilantfoodworks7134";
            const url = `https://${subdomain}.zendesk.com/api/v2/users/${data.results[i].assignee_id}`;
            var settings = {
              url: url,
              type: "GET",
              dataType: "json",
            };

            await client.request(settings).then(function (data) {
              nameToRender = data.user.name;
            });
            let message = findValueById(
              19438958642449,
              data.results[i].custom_fields
            );

            let link =
              "https://jubilantfoodworks7134.zendesk.com/agent/tickets/" +
              data.results[i].id;
            appendSupervisorSectionData.innerHTML += `
                <tr>
                <td onclick="window.open('${link}', '_blank')" class="pointer" style="padding-left:7%">${data.results[i].id}</td>
                <td>${nameToRender}</td>
                <td>${message}</td>

                <td style="padding-left:7%">${formattingTime}</i></td>
                </tr>
                `;
          }
        }
      }
    });
  }
}

async function checkSuperVisorTicket() {
  //console.log(Userid, "check2");
  const params = {
    query: `assignee:${Userid}`,
  };

  var subdomain = "jubilantfoodworks7134";
  const url = `https://${subdomain}.zendesk.com/api/v2/search?query=${params.query}`;
  var settings = {
    url: url,
    type: "GET",
    dataType: "json",
  };

  await client.request(settings).then(function (data) {
    for (let i = 0; i < data.results.length; i++) {
      if (data.results[i].id == ticketId) {
        accordionExample.style.display = "block";
        break;
      }
    }
  });
}

setTimeout(checkSuperVisorTicket, 2000);
