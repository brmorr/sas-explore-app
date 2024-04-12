/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import "./Dashboard.css";

export function Dashboard({ packageUri }) {
  return (
    <div id="content-container" className="page-container wide">
      <div className="text-container">
        <img
          // src="https://www.sas.com/en_us/navigation/header/global-header/_jcr_content/par/styledcontainer_3b8d/par/image_baf8.img.png/1484576145415.png"
          src="sasLogo.svg"
          alt="SAS Logo"
          title="SAS Logo"
          className="logo"
        />
        <h1>eCalico Business Analysis</h1>
        <p>
          eCalico has a long history of strong market performance. We know that
          our success is driven by customer satisfaction so we are doubling-down
          on our efforts to improve customer satisfaction. Product Returns is an
          area we will focus on the remaining months this year as this is a
          direct indication of Customer Satisfaction. Please review this
          Business Analysis portal to better understand areas where your
          division can have impact to improve Product Returns and overall
          Customer Satisfaction.
        </p>
      </div>
      <div className="keyvalue drop-shadow dynamic-text-container">
        <sas-report-object
          objectName="ve2442"
          packageUri={packageUri}
        ></sas-report-object>
        <sas-report-object
          class="dynamic-text"
          objectName="ve2540"
          packageUri={packageUri}
        ></sas-report-object>
      </div>
      <div className="kv-grid-container">
        <sas-report-object
          class="keyvalue drop-shadow"
          objectName="ve25660"
          packageUri={packageUri}
        ></sas-report-object>
        <sas-report-object
          class="keyvalue drop-shadow"
          objectName="ve3306"
          packageUri={packageUri}
        ></sas-report-object>
        <sas-report-object
          class="keyvalue drop-shadow"
          objectName="ve802"
          packageUri={packageUri}
        ></sas-report-object>
        <sas-report-object
          class="keyvalue drop-shadow"
          objectName="ve246"
          packageUri={packageUri}
        ></sas-report-object>
        <sas-report-object
          id="esri-map"
          class="visualization drop-shadow"
          objectName="ve24283"
          packageUri={packageUri}
        ></sas-report-object>
      </div>
      <div className="href-container">
        <div className="href-content">
          <img
            className="href-image"
            src="https://img.freepik.com/free-vector/shoppers-walking-past-fashion-outlet-window-customers-wheeling-cart-with-bags-packages-flat-vector-illustration-consumerism-purchase-concept_74855-10153.jpg?w=2000"
          />
          <div className="href-text">
            <h3>Customer Satisfaction Surveys</h3>
            <p>
              How do you build engaging customer satisfaction surveys that get
              you quality feedback from your users?
            </p>
            <a href="https://userpilot.com/blog/customer-satisfaction-survey-saas/">
              <button className="primary-button">Learn more</button>
            </a>
          </div>
        </div>
        <div className="text-container">
          <h2>Returns & Warehouse Capacity</h2>
          <p>
            Customers don't return products if they are satisfied. High levels
            of returned products is an area impacting corporate revenue. Other
            revenue concerns are due to high inventory levels in our warehouses,
            as well as situations where returns are causing us to exceed
            warehouse capacity at certain locations.
          </p>
        </div>
        <div className="keyvalue drop-shadow dynamic-text-container">
          <sas-report-object
            objectName="ve222"
            packageUri={packageUri}
          ></sas-report-object>
          <sas-report-object
            class="dynamic-text"
            objectName="ve1902"
            packageUri={packageUri}
          ></sas-report-object>
        </div>
        <div className="viz-grid-container">
          <sas-report-object
            id="butterfly"
            class="visualization drop-shadow"
            objectName="ve161"
            packageUri={packageUri}
          ></sas-report-object>
          <sas-report-object
            id="bar-chart"
            class="visualization drop-shadow"
            objectName="ve147"
            packageUri={packageUri}
          ></sas-report-object>
          <sas-report-object
            id="line-chart"
            class="visualization drop-shadow"
            objectName="ve2638"
            packageUri={packageUri}
          ></sas-report-object>
        </div>
        <div className="text-container">
          <h2>Monitor Returns</h2>
          <p>
            What are the primary reasons that customers return products? How can
            we address those issues?
          </p>
        </div>
        <div className="href-container">
          <div className="href-content">
            <img
              className="href-image"
              src="https://thumbs.dreamstime.com/b/online-store-delivery-web-shop-retail-purchase-shiping-goods-market-purchasing-shopping-business-vector-internet-mobile-136501850.jpg"
            />
            <div className="href-text">
              <h3>7 Tips for Successful Product Returns Management</h3>
              <p>
                First, the bad news: about 30% of all products ordered online
                are returned. To eliminate returns, some e-commerce retailers
                consider making the return process difficult for consumers.
              </p>
              <a href="https://www.thefulfillmentlab.com/blog/returns-management-tips">
                <button className="primary-button">Learn more</button>
              </a>
            </div>
          </div>
        </div>
        <div
          className="
                returns-monitor-container"
        >
          <sas-report-object
            class="keyvalue drop-shadow"
            objectName="ve5168"
            packageUri={packageUri}
          ></sas-report-object>
          <sas-report-object
            class="keyvalue drop-shadow"
            objectName="ve5188"
            packageUri={packageUri}
          ></sas-report-object>
          <sas-report-object
            class="keyvalue drop-shadow"
            objectName="ve5205"
            packageUri={packageUri}
          ></sas-report-object>
          <sas-report-object
            class="keyvalue drop-shadow"
            objectName="ve5222"
            packageUri={packageUri}
          ></sas-report-object>
          <sas-report-object
            id="stacked-bar"
            class="visualization drop-shadow"
            objectName="ve208"
            packageUri={packageUri}
          ></sas-report-object>
          <sas-report-object
            id="pie-chart"
            class="visualization drop-shadow"
            objectName="ve494"
            packageUri={packageUri}
          ></sas-report-object>
          <sas-report-object
            id="pc-plot"
            class="visualization drop-shadow"
            objectName="ve350"
            packageUri={packageUri}
          ></sas-report-object>
        </div>
      </div>
    </div>
  );
}
