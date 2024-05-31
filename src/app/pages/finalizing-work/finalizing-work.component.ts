import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FirebaseConfigService } from 'src/app/services/firebase-config.service';
import { GRDetailsModel } from 'src/app/utils/grDetailsModel';
import { NotificationDataModel } from 'src/app/utils/notificationDataModel';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-finalizing-work',
  templateUrl: './finalizing-work.component.html',
  styleUrls: ['./finalizing-work.component.css']
})
export class FinalizingWorkComponent implements OnInit {
  list: GRDetailsModel[] = [];
  i: number = 0;
  chainName: string = "";  
  selectedApplicantsList: string[] = [];
  selectedIndex: number = -1;

  constructor(private firebaseConfigService: FirebaseConfigService, private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => this.chainName = params['chainName']);
    console.log("Chain Name:" + this.chainName);

    this.firebaseConfigService.getAllAppicants(this.chainName).subscribe(actionArray => {
      this.list = actionArray.map(item => {
        var recvdData = JSON.parse(JSON.stringify(item, this.firebaseConfigService.getCircularReplacer()));
        return {
          nonce: recvdData["nonce"],
          hash: recvdData["hash"],
          firmName: recvdData["data"]["firmName"],
          prevHash: recvdData["prevHash"],
          timeStamp: recvdData["timestamp"],
          applicantEmail: recvdData["data"]["sender"],
          bidAmount: recvdData["data"]["amount"],
          eta: recvdData["data"]['etaInDays'],
          bidType: recvdData["data"]['bidType']
        } as GRDetailsModel;
      });

      this.list.sort((a, b) => {
        if (a.bidAmount === b.bidAmount) {
          return a.eta - b.eta;
        } else {
          return a.bidAmount - b.bidAmount;
        }
      });
    });
  }

  onUpdateSelection(applicantEmail: string, index: number) {
    this.list.forEach(entry => {
      entry.selected = false;
    });
    this.list[index].selected = true;
    this.selectedIndex = index;
    this.selectedApplicantsList = [];
    this.selectedApplicantsList.push(this.list[index].applicantEmail);
  }

  isBidFinal(index: number): boolean {
    return this.list[index].bidType === "finalBid";
  }

  sendNotification() {
    console.log("Sending notification");
    this.sendFinalBidPlacingNotification();
    console.log(this.selectedApplicantsList);
  }

  async sendFinalBidPlacingNotification() {
    console.log("Selected List length:" + this.selectedApplicantsList.length);
    for (this.i = 0; this.i < this.selectedApplicantsList.length; this.i++) {
      console.log("Adding to Database");
      var currentTimeStamp = Date().toString();
      var notificationDataModel = new NotificationDataModel(
        false,
        "You have received tender for GR: " + this.chainName,
        "Congratulations !!! You have been selected",
        currentTimeStamp,
        this.chainName,
        "grAllocated"
      );

      const emailPayload = {
        emails: this.selectedApplicantsList[this.i],
        sub: "TenderSheild : Congratulations !!! You have been selected",
        msg: "You have received tender for GR: " + this.chainName + "\n\n\n\n\n\n Regards, \n TenderSheild"
      };

      this.http.post('https://backend-w7jm.onrender.com/api/send-emails', emailPayload).subscribe(response => {
        console.log(response);
      });

      await this.firebaseConfigService.sendNotificationToUser(this.selectedApplicantsList[this.i], notificationDataModel);
      console.log("Notification Sent");
      console.log("FirmName:" + this.list[this.selectedIndex].firmName);
      var submitDetailMap = {
        "userEmail": this.selectedApplicantsList[0],
        "userBidAmount": this.list[this.selectedIndex].bidAmount,
        "firmName": this.list[this.selectedIndex].firmName,
        "etaInDays": this.list[this.selectedIndex].eta,
        "chainName": this.chainName,
        "bidType": "bidFinalized"
      };
      await this.firebaseConfigService.placeBid(submitDetailMap);
      await this.firebaseConfigService.assignTaskTo(this.chainName, this.list[this.selectedIndex].firmName);
      window.alert("GR associated successfully");
      this.router.navigate(["adminHomePage"]);
    }
  }
}
