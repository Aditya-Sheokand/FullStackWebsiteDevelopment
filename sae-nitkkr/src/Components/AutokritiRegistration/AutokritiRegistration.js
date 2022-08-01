//Registeration Page made for Autokriti 2.0
import React, { useEffect, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import $ from "jquery";
import "./AutokritiRegistration.css";
import saelogo from "../../Assets/SAELOGO.png";
import emailjs from "@emailjs/browser";

import db from "../../Firebase.js";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer(black)/FooterBlack";

function Quizsignup() {
  let timestamp = "";
  var [finalcost, setFinalcost] = useState(0);

  function checkAllFields() {
    const { name, email, phone, college, branch, semester, referal, timeSlot } =
      userData;
    if (name && email && phone && college && branch && semester) {
      //if all fields are entered
      if (phone.length != 10) {
        alert("Please enter a valid mobile number");
        return false;
      } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        alert("Please enter a valid email address.");
        return false;
      } else if (document.getElementById("agree").checked) {
        return true;
      } else {
        alert("Please tick the checkbox under instructions to proceed");
        return false;
      }
    } else {
      alert("Please fill the data");
      return false;
    }
  }

  const calculateAmount = async () => {
    var Mechanical = document.getElementById("amb_mechanical").checked;
    var IOT = document.getElementById("amb_IOT").checked;
    var EV = document.getElementById("amb_EV").checked;
    var kuchtotha = document.getElementById("amb_kuchtotha").checked;

    if (Mechanical == true) finalcost += 1;
    if (IOT == true) finalcost += 2;
    if (EV == true) finalcost += 3;
    if (kuchtotha == true) finalcost += 4;

    document.getElementById("original_price").innerText = finalcost;
    
   // await setDoc(doc(db, "finalcost", 'doccost'), {'cost': finalcost});

  //   const result = await fetch('http://localhost:3000/razorpay', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify("4")
  //  } )

  //  const resultinJson = await result.json();
  //  console.log(resultinJson);

  var url = "http://localhost:3000/result";

var xhr = new XMLHttpRequest();
xhr.open("POST", url);

xhr.setRequestHeader("Accept", "application/json");
xhr.setRequestHeader("Content-Type", "application/json");

xhr.onreadystatechange = function () {
   if (xhr.readyState === 4) {
      console.log(xhr.status);
      console.log(xhr.responseText);
   }};

var data = `{
  "cost": ${finalcost}
}`;

xhr.send(data);

  }

  const makePayment = async () => {
    const checkAllData = true;
    calculateAmount();
    if (checkAllData) {
      const res = await initializeRazorpay();
      document.getElementById("payform-button1").disabled = true;
      document.getElementById("payform-button1").style.background = "grey";
      setTimeout(() => {
        document.getElementById("payform-button1").disabled = false;
        document.getElementById("payform-button1").style.background = "#1a3c7f";
      }, 10000);

      if (!res) {
        alert("Razorpay SDK Failed to load");
        return;
      }

      // Make API call to the serverless API
      const data = await fetch("http://localhost:3000/razorpay", {
        method: "POST",
      }).then((t) => t.json());

      console.log(data);
      var options = {
        key: "rzp_test_4N9UbRbW9Gp0Mt", // Enter the Key ID generated from the Dashboard
        name: "SAE NIT Kurukshetra",
        currency: data.currency,
        amount: data.amount,
        order_id: data.id,
        description: "Thankyou for your test donation",
        image: { saelogo },
        handler: async (response) => {
          await handler(response);
          await set_to_database();
          console.log(options);
          //window.location = `/register_confirmation/${timestamp}`;
        },
        prefill: {
          name: "SAE NIT Kurukshetra",
          email: "saenitkurukshetra@gmail.com",
          contact: "9650735458",
        },
      };

      const set_to_database = async () => {
        sendEmail();
        const Saving_user_data = userData;
        let gotit = await setDoc(
          doc(db, "paymentregistrationid", timestamp),
          Saving_user_data
        );
      };

      const sendEmail = () => {
        const toSend = {
          name: userData.name,
          sem: userData.semester,
          branch: userData.branch,
          email: userData.email,
          college: userData.college,
          OrderId: userData.orderid,
          PaymentId: userData.paymentid,
          Phone: userData.phone,
          QRCodeURL: `https://saenitkurukshetra.in/registered/${userData.paymentid}`,
        };
        emailjs
          .send(
            "service_dqf2x44",
            "template_zezhpzf",
            toSend,
            "ulnoJlsECTLQyCRZ5"
          )
          .then(
            function (response) {
              console.log("SUCCESS!", response.status, response.text);
            },
            function (error) {
              console.log("FAILED...", error);
            }
          );
        // emailjs.send("service_dqf2x44","template_7wsqgfo","",'ulnoJlsECTLQyCRZ5',{
        //   // user_id: 'ulnoJlsECTLQyCRZ5',
        //   to_name: "Babloo bisleri",
        //   from_name: "saenitkurukshetra",
        //   message: toSend,
        //   email: userData.email,
        //   });
      };

      const handler = async (response) => {
        alert(
          "Congratulations! You have registered successfully with payment ID: " +
            response.razorpay_payment_id +
            " and order ID: " +
            response.razorpay_order_id
        );

        userData.orderid = response.razorpay_order_id;
        timestamp = response.razorpay_payment_id;
        userData.paymentid = timestamp;
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    }
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };

      //document.body.appendChild(script);
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  var [stuData, setStuData] = useState([]);

  //Display Referal
  function i_information_visible() {
    let k = document.getElementById("i_button_content");
    k.style.visibility = "visible";
    k.innerHTML =
      "Enter only if you are applying through an ambassador (max. 10% off)";
  }

  function i_information_nonvisible() {
    let k = document.getElementById("i_button_content");
    k.style.visibility = "hidden";
  }
  //Display TimeSLot
  // function i_information_visible_time()
  // {
  //   let j=document.getElementById('i_button_content');
  //   j.style.visibility="visible"
  //   j.innerHTML = "Slot-2 is specifically for students having their exams till 25th Feb, so please prefer Slot-1 unless you have similar problem / reason) ";
  // }

  // function i_information_nonvisible_time()
  // {
  //   let j=document.getElementById('i_button_content');
  //   j.style.visibility="hidden"
  // }

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    branch: "",
    semester: "",
    referal: "",
    transaction: "",
    orderid: "",
    paymentid: "",
    timeSlot: "26 Feb",
    status: "Registered",
  });

  let name, value;

  const postUserData = (event) => {
    name = event.target.name;
    value = event.target.value;
    var valid = false;
    //to check referal code
    if (name === "referal") {
      for (var i = 0; i < stuData.length; i++) {
        if (value == stuData[i]) {
          valid = true;
          break;
        }
      }
      if (valid === true) {
        document.querySelector(".referral_code_verified").style.display =
          "inline";
        event.target.setAttribute("readonly", "true");
        event.target.style.boxShadow = "none";
        event.target.style.border = "none";
        document.getElementById("original_price").style.textDecoration =
          "line-through";
        document.getElementById("original_price").style.color = "red";
        document.getElementById("discounted_price").style.color = "blue";
        document.getElementById("discounted_price").style.display = "block";
        document.getElementById("show_invalid").style.display = "none";
      } else {
        if (value.length >= 6) {
          document.getElementById("show_invalid").style.display = "block";
        } else {
          document.getElementById("show_invalid").style.display = "none";
        }
        document.querySelector(".referral_code_verified").style.display =
          "none";
      }
    }

    //to make sure same person is not registering again
    if (name == "email") {
      for (var i = 0; i < emailData.length; i++) {
        if (value == emailData[i]) {
          document.getElementById("show_email_is_registered").style.display =
            "block";
          document.getElementById("payform-button1").disabled = true;
          document.getElementById("payform-button1").style.background = "grey";
          //document.getElementById("payform-button2").disabled = true;
          break;
        } else {
          document.getElementById("show_email_is_registered").style.display =
            "none";
          document.getElementById("payform-button1").disabled = false;
          document.getElementById("payform-button1").style.background =
            "#1a3c7f";
          //document.getElementById("payform-button2").disabled = false;
        }
      }
    }

    setUserData({ ...userData, [name]: value });

    // console.log(userData);
  };

  var [stuData, setStuData] = useState([]);
  var [colStuData, setColStuData] = useState([]);

  var [refData, setRefData] = useState([]);
  var [colRefData, setColRefData] = useState([]);

  var [docIdData, setDocIdData] = useState([]);
  var [colDocIdData, setColDocIdData] = useState([]);

  var [emailData, setEmailData] = useState([]);

  //this async function is to check for applying discount while typing referal code
  async function getFinalAmbInfo() {
    //final ambassadors
    const stuInfo = collection(db, "finalStudentAmbassador");
    const stuInfo_doc = await getDocs(stuInfo);
    //final college representatives
    const colStuInfo = collection(db, "collegeRepresentatives");
    const colStuInfo_doc = await getDocs(colStuInfo);

    colStuData = colStuInfo_doc.docs.map((doc) => doc.data().referralCode);
    stuData = stuInfo_doc.docs.map((doc) => doc.data().referralCode);

    stuData = stuData.concat(colStuData);

    setStuData(stuData);

    //email data
    const emailsDatabase = collection(db, "autokritiRegistration");
    const emailsDatabase_doc = await getDocs(emailsDatabase);

    emailData = emailsDatabase_doc.docs.map((doc) => doc.data().email);

    setEmailData(emailData);
  }

  useEffect(() => {
    if (stuData.length === 0) {
      getFinalAmbInfo();
    }
  });

  //this function runs when you click on paynow

  // const routeChange = async (event) => {
  //   event.preventDefault();
  //   const { name, email, phone, college, branch, semester, referal, timeSlot } =
  //     userData;

  //   async function getFinalAmbInfo() {
  //     //final ambassadors
  //     const stuInfo = collection(db, "finalStudentAmbassador");
  //     const stuInfo_doc = await getDocs(stuInfo);
  //     stuData = stuInfo_doc.docs.map((doc) => doc.data().referralCode);

  //     //final college representatives
  //     const colStuInfo = collection(db, "collegeRepresentatives");
  //     const colStuInfo_doc = await getDocs(colStuInfo);
  //     colStuData = colStuInfo_doc.docs.map((doc) => doc.data().referralCode);

  //     refData = stuInfo_doc.docs.map((doc) => doc.data().numberReferrals); //final ambassadors
  //     colRefData = colStuInfo_doc.docs.map((doc) => doc.data().numberReferrals); //final college representatives

  //     docIdData = stuInfo_doc.docs.map((doc) => doc.id); //final ambassadors
  //     colDocIdData = colStuInfo_doc.docs.map((doc) => doc.id); //final college representatives

  //     setStuData(stuData);
  //     setColStuData(colStuData);
  //     setRefData(refData);
  //     setDocIdData(docIdData);

  //     setColRefData(colRefData);
  //     setColDocIdData(colDocIdData);
  //   }

  //   getFinalAmbInfo();

  //   if (name && email && phone && college && branch && semester) {
  //     //if all fields are entered
  //     if (document.getElementById("agree").checked) {
  //       if (referal) {
  //         var valid = false;
  //         for (var i = 0; i < stuData.length; i++) {
  //           if (referal == stuData[i]) {
  //             valid = true;
  //             break;
  //           }
  //           //college student
  //           else if (i < colStuData.length) {
  //             if (referal == colStuData[i]) {
  //               valid = true;
  //               break;
  //             }
  //           }
  //         }

  //         if (valid) {
  //           window.open("https://rzp.io/l/uIZPhx2y"); //discount
  //         } else {
  //           window.open("https://rzp.io/l/e87mGYT"); //no discount
  //         }
  //       } else {
  //         window.open("https://rzp.io/l/e87mGYT"); //no discount
  //       }

  //       document.getElementById("payform-button2").disabled = false;
  //       document.getElementById("transaction").disabled = false;

  //       return true;
  //     } else {
  //       alert("Please tick the checkbox under instructions to proceed");
  //       return false;
  //     }
  //   } else {
  //     alert("Please fill the data");
  //   }
  // };

  return (
    <>
      <NavBar />
      <br />
      <p className="payform-heading">REGISTRATION FORM</p>
      <div className="payform-container">
        <div method="POST" className="payform-form">
          <div className="field">
            {" "}
            <span className="payform-label">Full Name * </span>
            <br />
            <input
              className="payform-input"
              type="text"
              alt="Name"
              name="name"
              id="amb_name"
              required="required"
              value={userData.name}
              onChange={postUserData}
            />{" "}
          </div>

          <div className="field">
            <span className="payform-label">Email id* </span>
            <br />
            <input
              className="payform-input"
              type="Email"
              name="email"
              id="amb_email"
              required="required"
              value={userData.email}
              onChange={postUserData}
            />{" "}
          </div>
          <div id="show_email_is_registered">
            This email has alreay been Registered
          </div>

          <div className="field">
            <span className="payform-label">Phone No * </span>
            <br />
            <input
              className="payform-input"
              type="number"
              name="phone"
              required="required"
              id="amb_phone"
              value={userData.phone}
              onChange={postUserData}
            />
          </div>
          <div className="field">
            <span className="payform-label">College</span>
            <br />
            <input
              className="payform-input"
              type="text"
              required="unrequired"
              name="college"
              id="amb_college"
              value={userData.college}
              onChange={postUserData}
            />{" "}
          </div>
          <div className="field">
            <span className="payform-label"> Branch </span>
            <br />
            <input
              className="payform-input"
              type="name"
              name="branch"
              required="unrequired"
              id="amb_branch"
              value={userData.branch}
              onChange={postUserData}
            />
          </div>

          {/* <div className="field">
            {" "}
            <span className="payform-label"> Semester </span>
            <br />
            <input
              className="payform-input"
              type="email"
              name="semester"
              alt="semester"
              id="amb_semester"
              required="unrequired"
              value={userData.semester}
              onChange={postUserData}
            />
          </div> */}

          <div className="field_select">
            <span className="payform-label">Semester</span>
            <select
              className="payform-dropdown"
              name="semester"
              id="amb_semester"
              required="unrequired"
              value={userData.semester}
              onChange={postUserData}
            >
              <option defaultValue={"DEFAULT"} disabled hidden>
                Choose here
              </option>
              <option value="DEFAULT">--None Selected--</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
            </select>
          </div>

          <div className="field">
            {" "}
            <span className="payform-label"> Referal Code(optional code) </span>
            <img
              className="referral_code_verified"
              alt="sos"
              id="referral_code_verified"
              src="https://img.icons8.com/color/48/000000/checked-2--v1.png"
            />
            <br />
            <div id="referal_check">
              <input
                className="payform-input"
                type="email"
                name="referal"
                alt=""
                id="referal_code"
                required="unrequired"
                value={userData.referal}
                onChange={postUserData}
              />
              <img
                id="ref_image"
                alt="sos"
                src="https://img.icons8.com/external-dreamstale-lineal-dreamstale/32/000000/external-information-camping-dreamstale-lineal-dreamstale.png"
                onMouseOver={i_information_visible}
                onMouseOut={i_information_nonvisible}
              />
            </div>
          </div>

          {/* Choose dempartment */}
          <div className="field">
            <span className="payform-label"> Select Your Departments </span>
            <br />
            <div className="main-chheckbox">
              <div className="department-checkbox">
                <input
                  type="checkbox"
                  name="Mechanical"
                  required="unrequired"
                  id="amb_mechanical"
                />
                <span for="Mechanical">Mechanical</span>
              </div>
              <div className="department-checkbox">
                <input
                  type="checkbox"
                  name="IOT"
                  required="unrequired"
                  id="amb_IOT"
                />
                <span for="IOT">IOT</span>
              </div>
              <div className="department-checkbox">
                <input
                  type="checkbox"
                  name="EV"
                  required="unrequired"
                  id="amb_EV"
                />
                <span for="EV">EV</span>
              </div>
              <div className="department-checkbox">
                <input
                  type="checkbox"
                  name="kuch to tha"
                  required="unrequired"
                  id="amb_kuchtotha"
                />
                <span for="kuchtotha">kuch to tha</span>
              </div>
            </div>
          </div>

          <div id="show_invalid">The Referal Code is Invalid</div>
          <div id="pay_price">
            <div id="pay_price_title">Price: &nbsp; &#8377; &nbsp;</div>
            <div id="original_price">(To be calculated)</div>
            <div id="discounted_price">&#8377; 0</div>
          </div>
          <div id="pay_button">
            <div id="paynow">
              <button
                onClick={makePayment}
                className="payform-button"
                id="payform-button1"
              >
                ₹ &nbsp; Pay Now
              </button>
            </div>
            <div id="i_button_content">
              <h4></h4>
            </div>
          </div>

          {/* <div className="field">
            {" "}
            <span className="payform-label"> Payment ID </span>
            <br />
            <input
              id="transaction"
              className="payform-input"
              type=""
              name="transaction"
              alt=""
              disabled={true}
              required=""
              value={userData.transaction}
              onChange={postUserData}
            />
          </div>

          <br /> */}

          {/* <div className="field_select">
            <span className="payform-label">Time Slot * 
            </span>
            <div style={{display: 'flex'}}>
              <select 
                className="payform-dropdown" 
                name="timeSlot" 
                id="time_slot" 
                required 
                value={userData.timeSlot} 
                onChange={postUserData}> 
                  <option selected value="No Selection">-- Select An Option --</option>
                  <option value="12 Feb">Slot 1 - From 12&#x1D57;&#x02B0; Feb</option>
                  <option value="26 Feb">Slot 2 - From 26&#x1D57;&#x02B0; Feb</option>
                  <option value="Any Slot">No Preference</option>
              </select> 
            </div>
            <p style={{fontSize: '10px'}}>Slot-2 is specifically for students having their exams till 25th Feb, so please prefer Slot-1 unless you have similar problem / reason)</p>
          </div> */}

          {/* <button
            onClick={submit}
            id="payform-button2"
            className="payform-button2"
          >
            Confirm Registration
          </button> */}
        </div>

        <div className="payform-infocontain">
          <div className="payform-info">
            <FaInfoCircle /> &nbsp;{" "}
            <span id="quiz_registration">Instructions</span>
            <p className="instruction_para">
              * Make sure your email id is correct as you will be getting
              confirmation on that email
            </p>
            <p className="instruction_para">
              * After clicking on Pay, You will be redirected to confirmation
              page, make sure to download the <b>QR CODE</b> available there.
            </p>
            <p className="instruction_para">
              * You have to show QR code at the time of arrival.
            </p>
            <p className="instruction_para">
              * In case of any issue or payment failure, please contact
              +91-9650735458
            </p>
            <p className="instruction_para">* Referal IDs are case-sensitive</p>
          </div>

          <br />

          <div className="payform-checkbox">
            <input type="checkbox" id="agree" name="" value="" />
            <div id="read_content">
              I have read and understood the instructions
            </div>

            <br />
            <br />
          </div>

          <br />
          <br />
        </div>
      </div>

      <br />

      <Footer />
    </>
  );

  // function submit() {
  //   var studentName = document.getElementById("amb_name");
  //   var collegeName = document.getElementById("amb_college");
  //   var branch = document.getElementById("amb_branch");
  //   var semester = document.getElementById("amb_semester");
  //   var phone = document.getElementById("amb_phone");
  //   var email = document.getElementById("amb_email");
  //   var referalcode = document.getElementById("referal_code");
  //   var transaction = document.getElementById("transaction");
  //   var dateOfSubmission = new Date().toLocaleString() + "";
  //   var timeSlot = "26 Feb";

  //   const docdata = {
  //     dateOfSubmission: dateOfSubmission,
  //     studentName: studentName.value,
  //     collegeName: collegeName.value,
  //     branch: branch.value,
  //     semester: semester.value,
  //     phone: phone.value,
  //     email: email.value,
  //     referalcode: referalcode.value,
  //     transaction: transaction.value,
  //     timeSlot: timeSlot,
  //   };

  //   validateForm(docdata);
  // }

  // //form validation
  // function validateForm(docdata) {
  //   if (
  //     docdata.studentName == "" ||
  //     docdata.collegeName == "" ||
  //     docdata.branch == "" ||
  //     docdata.phone == "" ||
  //     docdata.email == "" ||
  //     docdata.transaction == ""
  //   ) {
  //     alert("Please fill up the required fields.");
  //   } else if (docdata.phone.length != 10) {
  //     alert("phone number should be of length 10.");
  //   } else if (
  //     !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(docdata.email)
  //   ) {
  //     alert("Please enter a valid email address.");
  //   } else {
  //     setInfo(docdata);
  //   }
  // }

  // function deletedata() {
  //   var studentName = document.getElementById("amb_name");
  //   var collegeName = document.getElementById("amb_college");
  //   var branch = document.getElementById("amb_branch");
  //   var semester = document.getElementById("amb_semester");
  //   var phone = document.getElementById("amb_phone");
  //   var email = document.getElementById("amb_email");
  //   var referalcode = document.getElementById("referal_code");
  //   var transaction = document.getElementById("transaction");
  //   studentName.value = null;
  //   collegeName.value = null;
  //   branch.value = null;
  //   semester.value = null;
  //   phone.value = null;
  //   email.value = null;
  //   referalcode.value = null;
  //   transaction.value = null;
  // }

  // //save to database
  // async function setInfo(docdata) {
  //   document.getElementById("payform-button2").disabled = true;
  //   document.getElementById("payform-button2").style.backgroundColor = "gray";

  //   //check if referal code is present and update database by 1 count
  //   //this code will work only if number of college representatives are less than or equal in number to final ambasadors
  //   for (var i = 0; i < stuData.length; i++) {
  //     if (docdata.referalcode == stuData[i]) {
  //       refData[i] += 1;
  //       await updateDoc(doc(db, "finalStudentAmbassador", docIdData[i]), {
  //         numberReferrals: refData[i],
  //       });
  //       break;
  //     } else if (i < colStuData.length) {
  //       if (docdata.referalcode == colStuData[i]) {
  //         colRefData[i] += 1;
  //         await updateDoc(doc(db, "collegeRepresentatives", colDocIdData[i]), {
  //           numberReferrals: colRefData[i],
  //         });
  //         break;
  //       }
  //     }
  //   }

  //   var timestamp = String(new Date().getTime());
  //   await setDoc(doc(db, "autokritiRegistration", timestamp), docdata);
  //   // sending data for sending mail
  //   $.ajax({
  //     type: "POST",
  //     // url: 'http://localhost:5000/send_confirmation_mail',
  //     url: "https://mail-sender-nodemailer.herokuapp.com/send_confirmation_mail",
  //     data: JSON.stringify(docdata),
  //     contentType: "application/json",
  //     dataType: "json",
  //     success: function (resultData) {
  //       alert("Save Complete");
  //     },
  //     error: function (err) {
  //       console.log("error" + err);
  //     },
  //   });
  //   alert("Congratulations! You are registered successfully.");
  //   deletedata();
  //   window.location.reload();
  // }
}

export default Quizsignup;
