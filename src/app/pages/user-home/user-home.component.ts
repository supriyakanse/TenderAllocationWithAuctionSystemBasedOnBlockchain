import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseConfigService } from 'src/app/services/firebase-config.service';
import { GRDataModel } from 'src/app/utils/grDataModel';
import { async } from '@firebase/util';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css']
})
export class UserHomeComponent implements OnInit {

  list : GRDataModel[]=[];
  id:number = 0;

  constructor(private firebaseConfigService: FirebaseConfigService,private storage: AngularFireStorage,public authenticationService:AuthService,
    private route: ActivatedRoute,private router: Router,private http: HttpClient) { }

  ngOnInit(): void {
    this.firebaseConfigService.getAllGrs().subscribe(actionArray =>{
    
      this.list = actionArray.map(item =>{
        var recvdData = JSON.parse(JSON.stringify(item,this.firebaseConfigService.getCircularReplacer() ));
        return {
          chainId:recvdData["chainId"],
          grName:recvdData["name"],
          grAmount:recvdData["grAmount"],
          status : recvdData["status"],
          description : recvdData["description"],
          associatedTo:recvdData["associatedTo"],
          grDocumentUrl:recvdData["grDocumentUrl"],
        }as GRDataModel;
      });
    });
  }public downloadFile(url: string): void {
    this.storage.refFromURL(url).getDownloadURL().subscribe(downloadURL => {
      const a = document.createElement('a');
      a.href = downloadURL;
      a.target = '_blank';  
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, error => {
      console.error('Download error:', error);
    });
  }
  
  async applyForGr(chainName:string,bidAmount:number){
    this.router.navigate(["applicationForm", chainName, bidAmount]);
      console.log("Applying for GR :"+chainName);
      console.log("GR amount :"+bidAmount);
  }
}
