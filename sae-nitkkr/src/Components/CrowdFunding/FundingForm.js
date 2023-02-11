import { useEffect } from "react";
import React from "react";
import "./FundingForm.css";
import saelogo from "../../Assets/SAELOGO.png";
import db from "../../Firebase.js";
import {
  updateDoc,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function FundingForm() {
  function submit() {
    var FirstName = document.getElementById("fname");
    var LastName = document.getElementById("lname");
    // var CompanyName = document.getElementById("comp-name");
    var amount = document.getElementById("amount");
    var phone = document.getElementById("phone-no");
    var email = document.getElementById("comp-email");
    var longAns1 = document.getElementById("text1");
    var checkbox = document.getElementById("check");

    const fundingdata = {
      FirstName: FirstName.value,
      LastName: LastName.value,
      // CompanyName: CompanyName.value,
      amount: amount.value,
      phone: phone.value,
      email: email.value,
      longAnswer2: longAns1.value,
      timestamp: serverTimestamp(),
      orderid: "",
      paymentid: "",
    };
    // console.log(fundingdata);
    validateForm(fundingdata, checkbox);
  }

  //form validation
  function validateForm(fundingdata, checkbox) {
    if (
      fundingdata.FirstName == "" ||
      fundingdata.LastName == "" ||
      // fundingdata.CompanyName == "" ||
      fundingdata.phone == "" ||
      fundingdata.email == "" ||
      fundingdata.longAns1 == ""
    ) {
      alert("Please fill up the required fields.");
    } else if (fundingdata.phone.length != 10) {
      alert("phone number should be of length 10.");
    } else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(fundingdata.email)
    ) {
      alert("Please enter a valid email address.");
    } else if (checkbox.checked == false) {
      alert("Please accept the terms and condition.");
    } else {
      makePayment(fundingdata);
    }
  }

  function deletedata() {
    var FirstName = document.getElementById("fname");
    var LastName = document.getElementById("lname");
    // var CompanyName = document.getElementById("comp-name");
    var amount = document.getElementById("amount");
    var phone = document.getElementById("phone-no");
    var email = document.getElementById("comp-email");
    var longAns1 = document.getElementById("text1");

    FirstName.value = null;
    LastName.value = null;
    // CompanyName.value = null;
    amount.value = null;
    phone.value = null;
    email.value = null;
    longAns1.value = null;
  }

  const makePayment = async (fundingdata) => {
    const res = await initializeRazorpay();
    document.getElementById("comp-button").disabled = true;
    document.getElementById("comp-button").style.background = "grey";
    setTimeout(() => {
      document.getElementById("comp-button").disabled = false;
      document.getElementById("comp-button").style.background = "#E9910DFC";
    }, 8000);

    if (!res) {
      alert("Razorpay SDK Failed to load");
      return;
    }
    
    // Make API call to the serverless API
    const data = await fetch("https://saepayment.onrender.com/razorpay", {
      method: "POST",
      body: JSON.stringify({
        title: "Donation",
        body: fundingdata.amount,
        userId: 1,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }).then((t) => t.json());

    var options = {
      key: "rzp_live_p9zIgcTn6FVaOD",
      name: "SAE NIT Kurukshetra",
      currency: data.currency,
      amount: data.amount,
      order_id: data.id,
      description: "Thankyou for Donating",
      image: { saelogo },
      handler: async (response) => {
        await handler(response);
        await set_to_database();
        console.log(options);
      },
      prefill: {
        name: "SAE NIT Kurukshetra",
        email: "saenitkurukshetra@gmail.com",
        contact: "9650735458",
      },
    };

    const handler = async (response) => {
      fundingdata.orderid = response.razorpay_order_id;
      fundingdata.paymentid = response.razorpay_payment_id;
    };

    const set_to_database = async () => {
      var timestamp = String(new Date().getTime());
      await setDoc(doc(db, "FundingForm", timestamp), fundingdata);

      //set progress bar
      const docRef = doc(db, "FundingForm", "progressBar");
      const docSnap = await getDoc(docRef);
      var temp = docSnap.data().collectedAmount + fundingdata.amount;
      await updateDoc(docRef, { collectedAmount: temp} );

      alert("Thank you for Donating.");
      deletedata();
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
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
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="FundingForm" id="funding_form">
        <h3>DONATE US</h3>
        <div className="Form">
          <form>
            <div className="Field">
              <input
                type="text"
                name="First Name"
                placeholder="Name"
                required
                id="fname"
              />
              <input
                type="text"
                name="Last Name"
                id="lname"
                required
                placeholder="Last Name"
              />
            </div>
            <input
              type="number"
              name="phone"
              required
              id="phone-no"
              placeholder="phone No"
            />
            <input
              type="email"
              name="Email"
              id="comp-email"
              required
              placeholder="Email"
            />
            {/* <input
              type="text"
              name="CompanyName"
              id="comp-name"
              required
              placeholder="Company Name"
            /> */}

            <input
              type="number"
              name="amount"
              id="amount"
              required
              placeholder="amount"
            />
            <div className="msg">Message You Want to Convey To Our Team </div>
            <textarea
              type="text"
              id="text1"
              required
              placeholder="Type here..."
              rows="10"
            />
            <div className="check-Field">
              <input type="checkbox" id="check" required />I accept Terms and
              Conditions*
            </div>
            <button className="pay" type="button" id="comp-button" onClick={submit}>
              CONTINUE TO PAY
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
