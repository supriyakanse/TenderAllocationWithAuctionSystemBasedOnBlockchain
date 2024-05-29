// g-rlist-admin.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseConfigService } from './../../services/firebase-config.service';
import { GRDataModel } from './../../utils/grDataModel';
import { SchedulerService } from './../../services/scheduler.service';

@Component({
  selector: 'app-g-rlist-admin',
  templateUrl: './g-rlist-admin.component.html',
  styleUrls: ['./g-rlist-admin.component.css']
})
export class GRListAdminComponent implements OnInit {
  list: GRDataModel[] = [];
  filteredList: GRDataModel[] = [];
  selectedStatus: string = '';

  constructor(
    private firebaseConfigService: FirebaseConfigService,
    private schedulerService: SchedulerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Start the scheduler when the component initializes
    this.schedulerService.startScheduler().subscribe({
      next: (message) => {
        console.log(message); // Log any messages from the scheduler
      },
      error: (err) => {
        console.error('Scheduler error:', err);
      }
    });

    // Fetch all GRs initially
    this.firebaseConfigService.getAllGrs().subscribe(actionArray => {
      this.list = actionArray.map(item => {
        const recvdData = JSON.parse(JSON.stringify(item, this.firebaseConfigService.getCircularReplacer()));
        return {
          chainId: recvdData["chainId"],
          grName: recvdData["name"],
          grAmount: recvdData["grAmount"],
          status: recvdData["status"],
          description: recvdData["description"],
          associatedTo: recvdData["associatedTo"]
        } as GRDataModel;
      });

      this.applyFilter();
    });
  }

  onSelect(chainName: string): void {
    this.router.navigate(["applicantsList", chainName]);
    alert(chainName);
  }

  onFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus = target.value;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedStatus) {
      this.filteredList = this.list.filter(gr => gr.status.toLowerCase() === this.selectedStatus.toLowerCase());
    } else {
      this.filteredList = [...this.list];
    }
  }
}
