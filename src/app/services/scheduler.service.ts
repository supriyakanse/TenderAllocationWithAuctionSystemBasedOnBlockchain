// scheduler.service.ts
import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FirebaseConfigService } from './firebase-config.service';
import { GRDataModel } from '../utils/grDataModel';

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {

  constructor(private firebaseConfigService: FirebaseConfigService) { }

  
  /*startSchedulerForMonth(): Observable<any> {
    const oneMonthInMilliseconds = 30 * 24 * 60 * 60 * 1000;
    return timer(0, oneMonthInMilliseconds).pipe(
      switchMap(() => {
        return this.removeAllocatedEntries();
      })
    );
  }*/
  
  removeAllocatedEntries(): Observable<any> {
    return new Observable(observer => {
      this.firebaseConfigService.getAllGrs().subscribe(actionArray => {
        actionArray.forEach(item => {
          const recvdData = JSON.parse(JSON.stringify(item, this.firebaseConfigService.getCircularReplacer()));
          const grData: GRDataModel = {
            chainId: recvdData["chainId"],
            grName: recvdData["name"],
            grAmount: recvdData["grAmount"],
            status: recvdData["status"],
            description: recvdData["description"],
            associatedTo: recvdData["associatedTo"],
            grDocumentUrl: recvdData["grDocumentUrl"]
          };

          // Check if status is "allocated", then delete the entry
          if (grData.status.toLowerCase() === 'allocated') {
            this.firebaseConfigService.deleteGr(grData.grName).subscribe(() => {
              // Notify observer that an entry has been deleted
              observer.next(`Entry with chainId ${grData.grName} has been deleted.`);
            });
          }
        });
      });
    });
  }
}
