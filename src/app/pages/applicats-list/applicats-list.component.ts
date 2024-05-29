import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FirebaseConfigService } from 'src/app/services/firebase-config.service';
import { GRDetailsModel } from './../../utils/grDetailsModel';
import { NotificationDataModel } from './../../utils/notificationDataModel';
import emailjs from '@emailjs/browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-applicats-list',
  templateUrl: './applicats-list.component.html',
  styleUrls: ['./applicats-list.component.css']
})
export class ApplicatsListComponent implements OnInit {
  list: GRDetailsModel[] = [];
  filteredList: GRDetailsModel[] = [];
  i: number = 0;
  chainName: string = "";  
  selectedApplicantsList: string[] = [];
  bidAmountFilter: number | null = null;
  etaFilter: number | null = null;

  constructor(private firebaseConfigService: FirebaseConfigService,private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => this.chainName = params['chainName']);
    console.log("Chain Name:" + this.chainName);

    this.firebaseConfigService.getAllAppicants(this.chainName).subscribe(actionArray => {
      this.list = actionArray.map(item => {
        var recvdData = JSON.parse(JSON.stringify(item, this.firebaseConfigService.getCircularReplacer()));
        return {
          nonce: recvdData["nonce"],
          hash: recvdData["hash"],
          prevHash: recvdData["prevHash"],
          timeStamp: recvdData["timestamp"],
          applicantEmail: recvdData["data"]["sender"],
          bidAmount: recvdData["data"]["amount"],
          eta: recvdData["data"]['etaInDays'],
          bidType: recvdData["data"]['bidType']
        } as GRDetailsModel;
      });
      this.applyFilters();
    });
  }
  isAnyFinalBid(): boolean {
    return this.filteredList.some(gr => gr.bidType === 'finalBid');
  }
  
  applyFilters(): void {
    this.filteredList = this.list.filter(gr => {
      const bidAmountMatch = this.bidAmountFilter != null ? gr.bidAmount <= this.bidAmountFilter : true;
      const etaMatch = this.etaFilter != null ? gr.eta <= this.etaFilter : true;
      return bidAmountMatch && etaMatch;
    });
  }

  onUpdateSelection(applicantEmail: string, index: number): void {
    const listIndex = this.list.findIndex(item => item.applicantEmail === applicantEmail);
    if (this.list[listIndex].selected) {
      this.list[listIndex].selected = false;
      const indx = this.selectedApplicantsList.indexOf(applicantEmail);
      this.selectedApplicantsList.splice(indx, 1);
    } else {
      this.list[listIndex].selected = true;
      this.selectedApplicantsList.push(this.list[listIndex].applicantEmail);
    }
  }

  sendNotification(): void {
    console.log("Sending notification");
    if (this.selectedApplicantsList.length === 0) {
      window.alert("No Applicant selected");
    } else {
      this.sendFinalBidPlacingNotification();
    }
    console.log(this.selectedApplicantsList);
  }

  isBidFinal(index: number): boolean {
    return this.list[index].bidType !== "finalBid";
  }

  async sendFinalBidPlacingNotification(): Promise<void> {
    var notificationDataModel: NotificationDataModel;
    console.log("Selected List length:" + this.selectedApplicantsList.length);
    for (const email of this.selectedApplicantsList) {
      console.log("Adding to Database");
      var currentTimeStamp = new Date().toString();
      notificationDataModel = new NotificationDataModel(
        false,
        "You have been selected for further process of GR: " + this.chainName,
        "Approved for final bidding",
        currentTimeStamp,
        this.chainName,
        "finalBidding"
      );


const emailPayload = {
  emails: this.selectedApplicantsList[this.i]  ,
  sub:"TenderSheild : Approved for final bidding",
  msg:"You have been selected for further process of GR: " + this.chainName+"\n Please login into System and submit final bid \n\n\n\n\n\n Regards, \n TenderSheild"
};

this.http.post('https://backend-w7jm.onrender.com/api/send-emails', emailPayload).subscribe(response => {
  console.log(response);
});


      // Send email
      // emailjs.init('4Ipk8O8JYwkZfZTqk');
      // let response = await emailjs.send("service_23q7l2x", "template_e3xttfa", {
      //   from_name: "TenderSheild",
      //   to_name: this.selectedApplicantsList[this.i],
      //   to_email:this.selectedApplicantsList[this.i],
      //   from_email:"supriyak8403@gmail.com",
      //   message: "Approved for final bidding.\n\n You have been selected for further process of GR: " + this.chainName + " \n\nPlease login into system and submit final bid.",
      // });

      // console.log("response from emailjs", response);

      this.firebaseConfigService.sendNotificationToUser(email, notificationDataModel);
    }
    window.alert("Notification sent successfully");
    this.router.navigate(["adminHomePage"]);
  }

  finalizingWork(): void {
    console.log("ChainNAME:" + this.chainName);
    this.router.navigate(["finalizeWork", this.chainName]);
  }
}
