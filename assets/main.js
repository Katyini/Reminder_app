const client = ZAFClient.init();
const email = "pranshu.rastogi@jublfood.com";
const password = "JfLUaTZenD#0187";
const token = "I6KTpmScKVr8xiuLB3F49UDCUbZ1SCm0mshAkHcQ";

client.invoke("resize", { width: "380px", height: "376px" });

const objectId = "reminder_data";
let recordKey;
// let isAgent = false;
// let isSupervisor = false;
///FOR DEFAULT BEHAVIOUR OF POPUP WINDOW
function popUp() {
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

var TICKETID;
client
  .get("ticket.id")
  .then((data) => {
    TICKETID = data["ticket.id"];
    console.log(TICKETID, "ticket iddd");
  })
  .catch((error) => {
    console.error("Error retrieving ticket ID:", error);
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
async function renderValue() {
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
  var valueofMessage;
  if (selectedIndex !== -1) {
    // Ensure an option is selected
    var selectedOption = message.options[selectedIndex];
    valueofMessage = selectedOption.innerHTML;
  }

  setReminder(nowTime, time.value, TICKETID, formattedDate, valueofMessage);
}

//For custom Objects

// async function updateData(){
//     let payload = {
//         ticket: {
//             custom_fields: [{ id: 18987446964497, value: "1" },
//             { id: 18987368351377, value: "2" },
//             { id: customObjectFields.isreminderset, value: false },
//             { id: 18987454802449, value: "4" },
//             { id: customObjectFields.message, value: "4" }
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
let userCustomRoleID;
var UserId;
var defaultGroupId;
async function selfUserID() {
  var config = {
    method: "GET",
    url: "https://jubilantfoodworks71341691410187.zendesk.com/api/v2/users/me",
    headers: {
      "Content-Type": "application/json",
    },
  };

  await client
    .request(config)

    .then(async function (response) {
      console.log(response, "self");
      UserId = response.user.id;
      userCustomRoleID = response.user.custom_role_id;
      console.log(userCustomRoleID, "self userCustomRoleID");
      //used to run searchtiket function if user is agent or supervisor
      // if (userCustomRoleID === 17593367892241) {
      //   isAgent = true;
      // }
      // if (
      //   userCustomRoleID === 18370219405585 ||
      //   userCustomRoleID === 18370303987089
      // ) {
      //   isSupervisor = true;
      // }
      var groupConfig = {
        method: "GET",
        url: `https://jubilantfoodworks71341691410187.zendesk.com/api/v2/users/${response.user.id}/group_memberships`,
        headers: {
          "Content-Type": "application/json",
        },
      };

      await client.request(groupConfig).then(function (response) {
        console.log(response, "group membership");
        if (response.group_memberships[1] != undefined) {
          defaultGroupId = response.group_memberships[1].group_id;
        } else {
          defaultGroupId = response.group_memberships[0].group_id;
        }
      });
    });
}

selfUserID();

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
  // console.log(
  //   processedHours,
  //   processedMinutes,
  //   processedSeconds,
  //   "processtime"
  // );
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
async function searchTickets() {
  // USER ID
  // var UserID = Userid;

  // CALLING SEARCH API FOR GETTING LOGGED IN USER DATA
  var notificationCount = 0;

  // const params = {
  //   query: `assignee:${UserId}`,
  // };
  console.log(UserId, "userid in searchticket");

  var settings = {
    url: `https://jubilantfoodworks71341691410187.zendesk.com/api/v2/custom_objects/${objectId}/records`,
    method: "GET",
    contentType: "application/json",
    headers: {
      Authorization: "Basic " + btoa(`${email}/token:${token}`),
    },
  };
  //var subdomain = "jubilantfoodworks71341691410187";
  // const url = `https://${subdomain}.zendesk.com/api/v2/custom_objects/${objectId}/records/search?updated_by_user_id%3A${UserId}`;
  // var settings = {
  //   url: url,
  //   method: "GET",
  //   contentType: "application/json",
  // };

  // client.request(settings).then(
  //   async function (data) {
  //     if (data.results.length != 0) {
  //       for (let i = 0; i < data.results.length; i++) {
  //         // ticket id data.results[i].id
  //         console.log(data, "searchTicket get api for userid working");
  await client
    .request(settings)
    .then(async (data) => {
      console.log(data, "searchTicket");

      tbody.innerHTML = "";
      // console.log(data, "custom object ticket id");
      for (let j = 0; j < data.custom_object_records.length; j++) {
        if (
          data.custom_object_records[j].custom_object_fields == [] ||
          data.custom_object_records[j].custom_object_fields == null ||
          data.custom_object_records[j].custom_object_fields == 0
        ) {
          continue;
        }
        // for (let i = 0; i < customObjectRecords.length; i++) {
        // if (data.results[i].status != "closed"){
        //     console.log(data.results[i],"data")
        //     }
        // FINDING VALUES OF REMINDER TIME AND REMINDER SUBMIT TIME

        console.log(
          data.custom_object_records[j].custom_object_fields.user_id,
          UserId,
          "comparing userid"
        );
        if (
          UserId == data.custom_object_records[j].custom_object_fields.user_id
        ) {
          console.log(
            data.custom_object_records[j].custom_object_fields.user_id,
            UserId,
            "inside if searchticket"
          );
          var checkingTime = 0;
          // let x = findValueById(18987454802449, data.results[i].custom_fields);
          // let y = findValueById(18987446964497, data.results[i].custom_fields);
          let x =
            data.custom_object_records[j].custom_object_fields
              .reminder_submit_time;
          let y =
            data.custom_object_records[j].custom_object_fields.reminder_time;
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
              data.custom_object_records[j].custom_object_fields.reminder_date

              // findValueById(18987368351377, data.results[i].custom_fields)
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
            //console.log(res, "res3");
            let formatting = timeToSeconds(res);
            //console.log(formatting, "formatting");
            let formattingTime = formatTime(formatting);
            count = updateTimeAndCount(formattingTime, notificationCount);
            if (count == 1) {
              notificationCount++;
            }

            let link =
              "https://jubilantfoodworks71341691410187.zendesk.com/agent/tickets/" +
              data.custom_object_records[j].custom_object_fields.ticket_id;

            if (formatting == 0) {
              checkingTime = 1;
            }
            if (formatting <= 10 && formatting >= 2) {
              console.log(
                data.custom_object_records[j].custom_object_fields.ticket_id,
                "reminder to true"
              );
              //    let dataID = data.results[i].id;
              await setReminderToTrue();

              await overdueReminders(null);

              setTimeout(popUp, 4000);
            }

            var checkingNaN = 1;
            if (isNaN(differenceSeconds)) {
              checkingNaN = 0;
            }
            console.log(
              data.custom_object_records[j].custom_object_fields,
              "setting data in upcoming reminder"
            );
            if (checkingTime == 0) {
              let message =
                data.custom_object_records[j].custom_object_fields.message;

              // setTimeLeftFieldData(formattingTime, data.results[i].id)
              // console.log(
              //   message,
              //   "message",
              //   link,
              //   "link",
              //   formattingTime,
              //   "formattingtime"
              // );
              tbody.innerHTML += ` <tr>
            <td onclick="window.open('${link}', '_blank')" class="pointer">${data.custom_object_records[j].custom_object_fields.ticket_id}</td>
            <td>${message}</td>
            <td>${formattingTime}</td>
            
            
          </tr>
            `;
            }
          }

          ///FOR CHANGING THE ICON OF POPOVER WINDOW. IT TAKES STRING OF EXACTLY 2 CHARACTERS
          //}
        }
      }
    })
    .catch((error) => console.log(error));
}
//     }
//   },
//   function (response) {
//     console.error(response);
//   }
// );
//       }
//if (isAgent || isSupervisor) {
setInterval(searchTickets, 9000);
//}
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
    // console.log(hours, minutes, seconds, "timedifference");
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
  // console.log(result, "updatetime");
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
  var subdomain = "jubilantfoodworks71341691410187";

  client
    .request({
      url: `https://${subdomain}.zendesk.com/api/v2/ticket_fields.json`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
    })

    .then(function (response) {
      console.log("Custom field created successfully.", response);
    })

    .catch(function (error) {
      console.error("Failed to create the custom field.");
      console.error("Error:", error);
    });
}

var preferCount = 0;
var dataToPassinOverdueFunc;
var showing24hoursgapReminder = document.getElementById(
  "showing24hoursgapReminder"
);
// async function showPrefferedTime() {
//   var preferredTimeSection = document.getElementById("preferredTimeSection");
//   let UserId;
//   var config = {
//     method: "GET",
//     url: "https://jubilantfoodworks71341691410187.zendesk.com/api/v2/users/me",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   };
//   console.log(preferredTimeSection, "showPrefferedTime");
//   await client.request(config).then(function (response) {
//     UserId = response.user.id;
//   });
//   console.log(UserId, "UserId showPrefferedTime");
//   // const params = {
//   //   query: `assignee%3A${UserId}`,
//   // };

//   // var subdomain = "jubilantfoodworks71341691410187";
//   //const url = `https://${subdomain}.zendesk.com/api/v2/search?query=%20${params.query}`;
//   const url = `https://jubilantfoodworks71341691410187.zendesk.com/api/v2/custom_objects/reminder_data/records?user_id=${UserId}`;
//   var settings = {
//     url: url,
//     type: "GET",
//     dataType: "json",
//   };
//   console.log(url, "url showPrefferedTime");
//   await client.request(settings).then(async function (data) {
//     console.log(data, "customObject using userID");
//     dataToPassinOverdueFunc = data;
//     // console.log(data, "showpreferredtime data");
//     // commented for now
//     await overdueReminders(data);
//     for (let i = 0; i < data.custom_object_records.length; i++) {
//       if (data.custom_object_records[i].custom_object_fields.isreminderset) {
//         const url2 = `https://jubilantfoodworks71341691410187.zendesk.com/api/v2/tickets/${data.custom_object_records[i].custom_object_fields.ticket_id}.json`;
//         const config = {
//           url: url2,
//           type: "GET",
//           dataType: "json",
//         };

//         client.request(config).then((ticketData) => {
//           if (
//             ticketData.ticket != 0 ||
//             ticketData.ticket != null ||
//             ticketData.ticket != undefined
//           ) {
//             for (let j = 0; j < ticketData.ticket.length; j++) {
//               for (let k = 0; k < ticketData.ticket[j].tags.length; k++) {
//                 let preferredTimeValue = findValueById(
//                   18272667475985,
//                   ticketData.ticket[j].fields
//                 );
//                 // let x = findValueById(18987454802449, data.results[i].custom_fields);
//                 // let y = findValueById(18987446964497, data.results[i].custom_fields);
//                 // console.log(data, "showpreferredtime");
//                 // console.log(preferredTimeValue, "showpreferredtime");
//                 //  for (let j = 0; j <= data.results[i].tags.length; j++) {
//                 let link =
//                   "https://jubilantfoodworks71341691410187.zendesk.com/agent/tickets/" +
//                   data.custom_object_records[i].custom_object_fields.ticket_id;
//                 // console.log(data.results[i].tags[j], "alltags");
//                 if (ticketData.ticket[j].tags[k] == "remind1") {
//                   popUp();
//                   showing24hoursgapReminder.innerHTML += `<div class="24hoursReminders"><h3>Notification-</h3>
//                         It's been 24 hours since the ticket number :<span onclick="window.open('${link}', '_blank')" class="pointer">${ticketData.ticket[j].id}</span><br/> is on the pending state <i class="material-icons" style="color:red;padding-left:7%;cursor:pointer">Okay</i></div>`;
//                 }
//                 if (ticketData.ticket[j].tags[k] == "remind2") {
//                   popUp();
//                   showing24hoursgapReminder.innerHTML += `<div class="48hoursReminders"><h3>Notification-</h3>
//                         It's been 48 hours since the ticket number :<span onclick="window.open('${link}', '_blank')" class="pointer">  ${ticketData.ticket[j].id}</span>  <br/> is on the pending state <i class="material-icons 48hours" style="color:red;padding-left:7%;cursor:pointer">Okay</i></div>`;
//                 }
//                 //}
//                 console.log(preferredTimeValue, "preferredTimeValue");
//                 if (preferredTimeValue != null) {
//                   var timeSlotVariable = preferredTimeValue;

//                   var timeSlotParts = timeSlotVariable.split("-");
//                   var startTimeHours = timeSlotParts[0];
//                   var endTimeHours = timeSlotParts[1];
//                   startTimeHours = convertTo24HourFormat(startTimeHours);
//                   let passstarttime = `${startTimeHours}:00:00`;
//                   endTimeHours = convertTo24HourFormat(endTimeHours);
//                   let passendTime = `${endTimeHours}:00`;
//                   console.log(passendTime, "passendtime");
//                   const currentTime = new Date();
//                   const currentHours = currentTime.getHours();
//                   console.log(
//                     currentHours,
//                     startTimeHours,
//                     "setreminder condition"
//                   );
//                   // Check if the current time is within one hour of the start time
//                   if (
//                     currentHours > startTimeHours - 1 &&
//                     currentHours < endTimeHours &&
//                     data.results[i].status != "closed"
//                   ) {
//                     setReminder(
//                       passstarttime,
//                       passendTime,
//                       ticketData.ticket[j].id,
//                       null,
//                       null
//                     );

//                     let link =
//                       "https://jubilantfoodworks71341691410187.zendesk.com/agent/tickets/" +
//                       ticketData.ticket[j].id;
//                     preferredTimeSection.innerHTML += ` <tr>
//                     <th scope="row">${preferCount + 1}</th>
//                     <td onclick="window.open('${link}', '_blank')" class="pointer">${
//                       ticketData.ticket[j].id
//                     }</td>
//                     <td>${timeSlotVariable}</td>

//                   </tr>
//                   `;
//                     preferCount++;
//                   }
//                 }
//               }
//             }
//           }
//         });
//       }
//     }
//   });
// }
async function showPrefferedTime() {
  var preferredTimeSection = document.getElementById("preferredTimeSection");

  // console.log("showPreferred clicked");
  let UserID;
  var config = {
    method: "GET",
    url: "/api/v2/users/me",
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
  const url = `/api/v2/search?query=${params.query}`;
  var settings = {
    url: url,
    type: "GET",
    dataType: "json",
  };
  await client.request(settings).then(async function (data) {
    dataToPassinOverdueFunc = data;
    // commented for now
    //await overdueReminders(null);
    for (let i = 0; i < data.results.length; i++) {
      // let x = findValueById(19438916224529, data.results[i].custom_fields);
      // let y = findValueById(19438938569233, data.results[i].custom_fields);
      // console.log(preferredTimeValue, "preferredTimeValue");
      if (data.results[i].id == 835) {
        console.log(data.results[i], "main");
      }
      for (let j = 0; j < data.results[i].tags.length; j++) {
        console.log(
          data.results[i].tags.length,
          data.results[i].tags[j],
          "checkingtags"
        );
        let link =
          "https://jubilantfoodworks71341691410187.zendesk.com/agent/tickets/" +
          data.results[i].id;

        if (
          data.results[i].tags[j] == "remind1" &&
          data.results[i].status !== "closed"
        ) {
          console.log(showing24hoursgapReminder, "dataPT");
          popUp();
          console.log(data.results[i].id, "24 hour section appending");
          if (showing24hoursgapReminder) {
            showing24hoursgapReminder.innerHTML += `<div class="24hoursReminders"><h3>Notification-</h3>
                        It's been 24 hours since the ticket number :<span onclick="window.open('${link}', '_blank')" class="pointer">${data.results[i].id}</span><br/> is on the pending state <i class="material-icons" style="color:red;padding-left:7%;cursor:pointer">Okay</i></div>`;
          }
        }
        if (
          data.results[i].tags[j] == "remind2" &&
          data.results[i].status !== "closed"
        ) {
          popUp();
          console.log(data.results[i].id, "48 hour section appending");
          if (showing24hoursgapReminder) {
            showing24hoursgapReminder.innerHTML += `<div class="48hoursReminders"><h3>Notification-</h3>
                        It's been 48 hours since the ticket number :<span onclick="window.open('${link}', '_blank')" class="pointer">  ${data.results[i].id}</span>  <br/> is on the pending state <i class="material-icons 48hours" style="color:red;padding-left:7%;cursor:pointer">Okay</i></div>`;
          }
        }
      }
      delete24HoursReminder();
      delete48HoursReminder();
      //console.log(preferredTimeValue, data.results, "preferredTimeValue1");
      let preferredTimeValue = findValueById(
        18272667475985,
        data.results[i].custom_fields
      );
      if (preferredTimeValue != null) {
        console.log(preferredTimeValue, "preferredTimeValue2");
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
        console.log(
          startTimeHours,
          endTimeHours,
          currentHours,
          data.results[i].id,
          "katiyayini check"
        );

        if (
          currentHours >= startTimeHours &&
          currentHours < endTimeHours &&
          data.results[i].status !== "closed"
        ) {
          console.log(
            passstarttime,
            passendTime,
            data.results[i].id,
            "argument passed to setreminder"
          );
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
setTimeout(showPrefferedTime, 2000);
// showPrefferedTime();
async function overdueReminders(supervisorData) {
  console.log(UserId, "overdue userid passed");
  const subdomain = "jubilantfoodworks71341691410187";

  // return new Promise((resolve, reject) => {
  const url = `/api/v2/custom_objects/reminder_data/records/search?page[100]&query=created_by_user_id=${UserId}`;
  const config = {
    url: url,
    method: "GET",
    contentType: "application/json",
    headers: {
      Authorization: "Basic " + btoa(`${email}/token:${token}`),
    },
  };

  client
    .request(config)
    .then(async (data) => {
      console.log(data, "data in overduereminder");
      console.log(data.custom_object_records.length, "data in overduereminder");

      console.log(supervisorData, "supervisorData");
      if (supervisorData !== null && supervisorData !== undefined) {
        data = supervisorData;
      }
      let customRecordLength = data.custom_object_records.length;
      if (customRecordLength > 0) {
        for (let i = 0; i < data.custom_object_records.length; i++) {
          data.custom_object_records[i].custom_object_fields.ticket_id = Number(
            data.custom_object_records[i].custom_object_fields.ticket_id
          );
          if (
            data.custom_object_records[i].custom_object_fields.isreminderset
          ) {
            const url2 = `/api/v2/tickets/${data.custom_object_records[i].custom_object_fields.ticket_id}.json`;
            const config2 = {
              url: url2,
              method: "GET",
              contentType: "application/json",
            };
            console.log(
              data.custom_object_records[i].custom_object_fields.ticket_id,
              "ticketID"
            );

            await client
              .request(config2)
              .then((ticketData) => {
                if (ticketData.ticket.status !== "closed") {
                  const message =
                    data.custom_object_records[i].custom_object_fields.message;
                  const link = `https://${subdomain}.zendesk.com/agent/tickets/${data.custom_object_records[i].custom_object_fields.ticket_id}`;

                  console.log(
                    data.custom_object_records[i],
                    "appending overdue"
                  );
                  //mark done will not beshown if user is supervisor
                  // if (userCustomRoleID == 18370219405585) {
                  //   console.log("supervisor overdue html");
                  //   appendOverdueSectionData.innerHTML += `
                  //   <tr>
                  //     <td onclick="window.open('${link}', '_blank')" class="pointer" style="padding-left:7%">${data.custom_object_records[i].custom_object_fields.ticket_id}</td>
                  //     <td>${message}</td>
                  //   </tr>`;
                  // } else {
                  console.log("agent overdue html");
                  appendOverdueSectionData.innerHTML += `
                      <tr>
                        <td onclick="window.open('${link}', '_blank')" class="pointer" style="padding-left:7%">${data.custom_object_records[i].custom_object_fields.ticket_id}</td>
                        <td>${message}</td>
                        <td class="delete" style="cursor:pointer"><i class="material-icons" style="color:red;padding-left:7%">Mark Done</i></td>
                      </tr>`;
                }
                // }
              })
              .catch((error) => {
                console.error("Error fetching ticket data:", error);
              });
          }
        }

        deleteOverdueRecord();
      }
    })
    .catch((error) => {
      console.error("Error fetching custom objects:", error);
    });
  // });
}

// overdueReminders()
setTimeout(overdueReminders, 2000);

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
async function setReminder(nowTime, endtime, id, ComingDate, message) {
  let customObjectExist = false;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so we add 1 and pad with '0' if needed.
  const day = String(now.getDate()).padStart(2, "0");
  let formattedDate = `${year}-${month}-${day}`;
  if (ComingDate == null) {
    ComingDate = formattedDate;
  }
  let messageValue = "Pending Form";
  if (message == null) {
    message = messageValue;
  }

  const customObject = {
    custom_object_record: {
      name: "reminder_data",
      custom_object_fields: {
        reminder_submit_time: nowTime,
        reminder_date: ComingDate,
        reminder_time: endtime,
        isreminderset: false,
        message: message,
        ticket_id: `${id}`,
        user_id: `${UserId}`,
      },

      external_id: `${id}`,
    },
  };
  try {
    let customObjectData = "";
    console.log(customObject, "customObject");
    // await client
    //   .request({
    //     //   url: `https://jubilantfoodworks71341691410187.zendesk.com/api/v2/custom_objects/${objectId}/records/search.json?query=ticket_id${ticketId}`,
    //     url: `/api/v2/search?query=%20assignee%3A${UserId}`,
    //     method: "GET",
    //     contentType: "application/json",
    //   })
    //  .then(async function (response) {
    //console.log(response.results[i].id, "tickets with userid");
    // if (response.results.length != 0) {
    //   for (let i = 0; i < response.results.length; i++) {
    //console.log(response.results[i].id, "tickets with userid");
    // ticket id response.results[i].id

    customObjectData = await client
      .request({
        url: `https://jubilantfoodworks71341691410187.zendesk.com/api/v2/custom_objects/${objectId}/records/search.json?query=%20ticket%3A${TICKETID}`,
        method: "GET",
        contentType: "application/json",
        headers: {
          Authorization: "Basic " + btoa(`${email}/token:${token}`),
        },
      })

      .then(async function (response) {
        console.log("RESPONSE S2", response);

        if (
          response.custom_object_records == [] ||
          response.custom_object_records == null ||
          response.custom_object_records == 0
        ) {
          console.log(response, "post request");
          await client
            .request({
              url: `https://jubilantfoodworks71341691410187.zendesk.com/api/v2/custom_objects/${objectId}/records`,
              method: "POST",
              contentType: "application/json",
              data: JSON.stringify(customObject),
              headers: {
                Authorization: "Basic " + btoa(`${email}/token:${token}`),
              },
            })
            .then((res) => console.log(res, "post request response"));
        } else {
          console.log("patch request running");
          client
            .request({
              url: `https://jubilantfoodworks71341691410187.zendesk.com/api/v2/custom_objects/${objectId}/records?external_id=${TICKETID}`,
              method: "PATCH",
              contentType: "application/json",
              data: JSON.stringify(customObject),
              headers: {
                Authorization: "Basic " + btoa(`${email}/token:${token}`),
              },
            })
            .then((res) => console.log(res, "patch request response"));
        }
      });
  } catch (error) {
    // console.log(response, "Custom object created successfully: ");

    console.log(`Error updating custom object: `, error);
    if (error.responseJSON && error.responseJSON.error) {
      console.log(`Error message: ${error.responseJSON.error.message}`);
      console.log(`Error code: ${error.responseJSON.error.code}`);
    }
  }

  //   var payload = {
  //     ticket: {
  //       custom_fields: [
  //         { id: 18987446964497, value: endtime },
  //         { id: 18987368351377, value: formattedDate },
  //         { id: customObjectFields.isreminderset, value: false },
  //         { id: 18987454802449, value: nowTime },
  //         { id: customObjectFields.message, value: message },
  //       ],
  //     },
  //   };

  //   client
  //     .request({
  //       url: `/api/v2/tickets/${id}.json`,
  //       method: "PUT",
  //       contentType: "application/json",
  //       data: JSON.stringify(payload),
  //     })

  //     .then(function (response) {
  //       searchTickets();
  //     })

  //     .catch(function (error) {
  //       console.error("Failed to update the custom field.");
  //       console.error("Error:", error);
  //     });
}

function delete24HoursReminder() {
  console.log("24 hours reminder func clicked");
  var TwentyFourHoursReminders =
    document.getElementsByClassName("24hoursReminders");
  var okayButton = document.getElementsByClassName("material-icons");
  console.log(okayButton, "okayButton24");
  console.log(TwentyFourHoursReminders, "shrish 1");
  console.log(okayButton, "shrish 2");

  for (let i = 0; i < TwentyFourHoursReminders.length; i++) {
    okayButton[i].addEventListener("click", async () => {
      console.log(
        okayButton[i].parentNode.childNodes[2].innerHTML,
        "24 hour function okayButton[i].parentNode.childNodes"
      );
      var textToTrim = okayButton[i].parentNode.childNodes[2].innerHTML;

      // console.log(textToTrim,typeof textToTrim,"printing")
      // var parts = textToTrim.split(':');
      // var ticketNumber = parts[1].trim();

      var data = {
        tags: ["remind1"],
      };
      var config = {
        method: "DELETE",
        url: `https://jubilantfoodworks71341691410187.zendesk.com/api/v2/tickets/${textToTrim}/tags.json`,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(data),
      };

      await client
        .request(config)
        .then(function (response) {
          console.log(response, "tagResponse");
          okayButton[i].parentNode.innerHTML = "";
        })

        .catch(function (error) {
          console.error("Failed to update the custom field.");
          console.error("Error:", error);
        });
    });
  }
}

function delete48HoursReminder() {
  var TwentyFourHoursReminders =
    document.getElementsByClassName("48hoursReminders");
  var okayButton = document.getElementsByClassName("48hours");
  console.log(okayButton, "okayButton48");
  for (let i = 0; i < TwentyFourHoursReminders.length; i++) {
    okayButton[i].addEventListener("click", async () => {
      console.log(
        okayButton[i].parentNode.childNodes,
        "48 hour function okayButton[i].parentNode.childNodes"
      );
      var textToTrim = okayButton[i].parentNode.childNodes[2].innerHTML;
      // console.log(textToTrim,typeof textToTrim,"printing")
      // var parts = textToTrim.split(':');
      // var ticketNumber = parts[1].trim();

      var data = {
        tags: ["remind2"],
      };
      var config = {
        method: "DELETE",
        url: `https://jubilantfoodworks71341691410187.zendesk.com/api/v2/tickets/${textToTrim}/tags.json`,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(data),
      };

      await client
        .request(config)
        .then(function (response) {
          //      console.log(config, "config", ticketNumber);
          // console.log(response, "tagResponse");
          okayButton[i].parentNode.innerHTML = "";
        })

        .catch(function (error) {
          console.error("Failed to update the custom field.");
          console.error("Error:", error);
        });
    });
  }
}

setTimeout(delete24HoursReminder, 2000);
setTimeout(delete48HoursReminder, 2000);

async function deleteOverdueRecord() {
  var deleteRecord = document.getElementsByClassName("delete");
  // console.log(deleteRecord, "deleteOverdueRecord");
  var del = document.querySelectorAll(".delete");
  for (let i = 0; i < deleteRecord.length; i++) {
    deleteRecord[i].addEventListener("click", async () => {
      const table = deleteRecord[i].parentNode.parentNode;
      const row = deleteRecord[i].parentNode;
      let ticketId = deleteRecord[i].parentNode.childNodes[1].innerHTML;
      console.log(ticketId, "ticketid above false");
      table.removeChild(row);
      await setReminderToFalse(ticketId);
    });
  }
}

// setTimeout(deleteOverdueRecord, 2000);
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
async function setReminderToFalse(ticketId) {
  console.log(ticketId, "inside set false");
  return new Promise((resolve, reject) => {
    const payloadObject = {
      custom_object_record: {
        custom_object_fields: {
          isreminderset: false,
        },
        name: objectId,
        external_id: `${ticketId}`,
      },
    };
    client
      .request({
        //https://jubilantfoodworks71341691410187.zendesk.com/api/v2/custom_objects/${objectId}/records?external_id=${ticketId}
        url: `https://jubilantfoodworks71341691410187.zendesk.com/api/v2/custom_objects/${objectId}/records?external_id=${ticketId}`,
        method: "PATCH",
        contentType: "application/json",
        data: JSON.stringify(payloadObject),
        headers: {
          Authorization: "Basic " + btoa(`${email}/token:${token}`),
        },
      })
      .then((response) => {
        console.log(`Updated Custom Object. reminder to false`, response);
        resolve(response);
      })
      .catch((error) => {
        console.error(`Error updating custom object:`, error);
      });
  });
}

function setReminderToTrue() {
  return new Promise((resolve, reject) => {
    const payloadObject = {
      custom_object_record: {
        custom_object_fields: {
          isreminderset: true,
        },
        name: objectId,
        external_id: `${TICKETID}`,
      },
    };
    client
      .request({
        url: `https://jubilantfoodworks71341691410187.zendesk.com/api/v2/custom_objects/${objectId}/records?external_id=${TICKETID}`,
        method: "PATCH",
        contentType: "application/json",
        data: JSON.stringify(payloadObject),
        headers: {
          Authorization: "Basic " + btoa(`${email}/token:${token}`),
        },
      })
      .then((response) => {
        console.log(`Updated Custom Object. reminder to true`, response);
        resolve(response);
      })
      .catch((error) => {
        console.error(`Error updating custom object:`, error);
      });
  });
}
var divToDisplayNone = document.getElementsByClassName("divToDisplayNone");
let overdueSectionForSupervisor = document.getElementById(
  "overdueSectionForSupervisor"
);
if (overdueSectionForSupervisor != undefined) {
  overdueSectionForSupervisor.style.display = "none";
}
function getSupervisorData() {
  console.log(userCustomRoleID, "katiyayini checkkkk");
  console.log("supervisor func running");
  var roles = [
    { 17593367892241: "BE Agent" },
    { 18370219405585: "BE Supervisor - 1" },
    { 18370303987089: "BE Supervisor - 2" },
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
  console.log(matchingField, "matchingField");

  // console.log(defaultGroupId, "defaultGrouPId");
  var overdueSection = document.getElementById("overdueSection");
  var accordionExample = document.getElementById("accordionExample");
  let overdueSectionTopBar = document.getElementsByClassName(
    "overdueSectionTopBar"
  );
  console.log(userCustomRoleID, "userCustomRoleID");
  if (userCustomRoleID == 18370219405585) {
    console.log(TICKETID, "ticketIDD");
    SupervisorSection.style.display = "block";
    accordionExample.style.display = "none";
    overdueSection.style.display = "block";
    console.log(overdueSectionTopBar, "checkkkkkkkkkkkkkkkkkkkkkkkkkk");
    if (divToDisplayNone.length > 0) {
      divToDisplayNone[0].style.display = "none";
    }

    const groupID = defaultGroupId;

    const url = `/api/v2/users/search.json?query=group_id:${groupID}`;
    const settings = {
      url: url,
      type: "GET",
      dataType: "json",
    };

    client
      .request(settings)
      .then(async function (data) {
        console.log(data, "groupID data");
        for (let i = 0; i < data.users.length; i++) {
          console.log(
            data.users[i].id,
            data.users[i].custom_role_id,
            "getFieldsOfAllAgents arguments passed"
          );
          await getFieldsOfAllAgents(
            data.users[i].id,
            data.users[i].custom_role_id
          );
          if (i == data.users.length - 1) {
            if (overdueSectionTopBar.length > 0) {
              overdueSectionTopBar[0].style.display = "none";
            }
          }
          // const url2 = `https://${subdomain}.zendesk.com/api/v2/custom_objects/reminder_data/records?user_id=${data.users[i].id}`;
          // const config = {
          //   url: url2,
          //   type: "GET",
          //   dataType: "json",
          // };
          // client.request(config).then(async function (userData)=>{

          //  })
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  }
}
setTimeout(getSupervisorData, 2000);

async function getFieldsOfAllAgents(userID, userCustomRoleID) {
  return new Promise(async (resolve) => {
    console.log("getFieldsOfAllAgents running");
    var roles = [
      { 17593367892241: "BE Agent" },
      { 18370219405585: "BE Supervisor - 1" },
      { 18370303987089: "BE Supervisor - 2" },
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
      console.log(userID, "katiyayini user ID");

      console.log("agent found to display");
      const url = `https://jubilantfoodworks71341691410187.zendesk.com/api/v2/custom_objects/${objectId}/records/search?&query=user_id:${userID}`;
      var settings = {
        url: url,
        type: "GET",
        contentType: "application/json",
        headers: {
          Authorization: "Basic " + btoa(`${email}/token:${token}`),
        },
      };

      await client.request(settings).then(async function (data) {
        console.log(data, "data123", userID);
        //await overdueReminders(data);
        console.log(appendOverdueSectionData, "appendOverdueSectionData");
        for (let i = 0; i < data.custom_object_records.length; i++) {
          if (
            data.custom_object_records[i].custom_object_fields.isreminderset
          ) {
            const url2 = `/api/v2/tickets/${data.custom_object_records[i].custom_object_fields.ticket_id}.json`;
            const config2 = {
              url: url2,
              method: "GET",
              contentType: "application/json",
            };
            console.log(
              data.custom_object_records[i].custom_object_fields.ticket_id,
              "ticketID"
            );

            await client
              .request(config2)
              .then((ticketData) => {
                if (ticketData.ticket.status !== "closed") {
                  const message =
                    data.custom_object_records[i].custom_object_fields.message;
                  const link = `https://jubilantfoodworks71341691410187.zendesk.com/agent/tickets/${data.custom_object_records[i].custom_object_fields.ticket_id}`;

                  console.log(
                    data.custom_object_records[i],
                    "appending overdue"
                  );
                  // if (UserId == 18370219405585) {
                  //   console.log("supervisor overdue html");
                  //   appendOverdueSectionData.innerHTML += `
                  //   <tr>
                  //     <td onclick="window.open('${link}', '_blank')" class="pointer" style="padding-left:7%">${data.custom_object_records[i].custom_object_fields.ticket_id}</td>
                  //     <td>${message}</td>
                  //   </tr>`;
                  // } else {
                  console.log("agent overdue html");
                  appendOverdueSectionData.innerHTML += `
                      <tr>
                        <td onclick="window.open('${link}', '_blank')" class="pointer" style="padding-left:7%">${data.custom_object_records[i].custom_object_fields.ticket_id}</td>
                        <td>${message}</td>
                      </tr>`;
                }
                //}
              })
              .catch((error) => {
                console.error("Error fetching ticket data:", error);
              });
          }

          ///NEW CODE

          let customObjectFields =
            data.custom_object_records[i].custom_object_fields;
          // for (let i = 0; i < data.results.length; i++) {
          // let timeLeft = findValueById(19092257553553, data.results[i].custom_fields);
          var checkingTime = 0;
          // let x = findValueById(18987454802449, data.results[i].custom_fields);
          // let y = findValueById(18987446964497, data.results[i].custom_fields);

          let x = customObjectFields.reminder_submit_time;
          let y = customObjectFields.reminder_time;
          // console.log(x, "x", y, "y");
          let xSeconds = timeToSeconds(x);
          let ySeconds = timeToSeconds(y);
          console.log(xSeconds, ySeconds, "xseconds yseconds");
          // NEED TO OPTIMIZE THIS CONDITION FOR THE DATES NOT EQUAL TO TODAY
          if (x != null && y != null) {
            let differenceSeconds = ySeconds - xSeconds;
            let differenceTime = secondsToTime(differenceSeconds);

            let res = updateTime(
              secondsToTime(ySeconds),
              secondsToTime(xSeconds),
              differenceTime,
              customObjectFields.reminder_date
              //findValueById(18987368351377, data.results[i].custom_fields)
            );
            console.log(res, "differenceSeconds");
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

            if (checkingTime == 0) {
              var nameToRender;

              var subdomain = "jubilantfoodworks71341691410187";
              const url = `https://${subdomain}.zendesk.com/api/v2/users/${data.custom_object_records[i].custom_object_fields.user_id}`;
              var settings = {
                url: url,
                type: "GET",
                dataType: "json",
              };

              await client.request(settings).then(async function (data) {
                console.log(data, "name getfieldsofallagents");
                nameToRender = data.user.name;
                let message = customObjectFields.message;

                let link =
                  "https://jubilantfoodworks71341691410187.zendesk.com/agent/tickets/" +
                  customObjectFields.ticket_id;
                console.log(
                  link,
                  nameToRender,
                  message,
                  "appending supervisor data"
                );
                console.log(appendSupervisorSectionData, "all agent ticket");
                appendSupervisorSectionData.innerHTML += `
                <tr>
                <td onclick="window.open('${link}', '_blank')" class="pointer" style="padding-left:7%">${customObjectFields.ticket_id}</td>
                <td>${nameToRender}</td>
                <td>${message}</td>

                <td style="padding-left:7%">${formattingTime}</i></td>
                </tr>
                `;
              });
            }
          }
          //}
        }
      });
    }
    resolve(true);
  });
}

async function checkSuperVisorTicket() {
  // console.log(UserId, "check2");
  const params = {
    query: `assignee:${UserId}`,
  };

  var subdomain = "jubilantfoodworks71341691410187";
  const url = `https://${subdomain}.zendesk.com/api/v2/search?query=${params.query}`;
  var settings = {
    url: url,
    type: "GET",
    dataType: "json",
  };

  await client.request(settings).then(function (data) {
    for (let i = 0; i < data.results.length; i++) {
      if (data.results[i].id == TICKETID) {
        accordionExample.style.display = "block";
        break;
      }
    }
  });
}

setTimeout(checkSuperVisorTicket, 2000);
