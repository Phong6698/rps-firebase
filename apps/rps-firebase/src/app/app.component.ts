import {Component, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ASharedInterface, Match, MATCH_COLLECTION, MoveEnum} from '@rps-firebase/shared';
import {CommonModule} from '@angular/common';
import {Auth, signInAnonymously, user} from '@angular/fire/auth';
import {filter, Observable, shareReplay, switchMap, tap} from 'rxjs';
import {doc, docData, DocumentReference, Firestore} from '@angular/fire/firestore';
import {Functions, httpsCallable, httpsCallableData} from '@angular/fire/functions';
import {fromPromise} from 'rxjs/internal/observable/innerFrom';
import {match} from 'cypress/types/minimatch';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'rps-firebase-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  something: ASharedInterface = {
    name: 'Phong Angular App',
    isSomething: true,
    amount: 6
  }

  user$ = user(this.auth)
  match$: Observable<Match> = this.user$.pipe(
    filter(user => !!user?.uid),
    switchMap(() => fromPromise(httpsCallable(this.functions, 'getMatch').call({}))),
    switchMap(res => {
      console.log(res.data);
      const matchDoc = doc(this.firestore, `${MATCH_COLLECTION}/${res.data}`) as DocumentReference<Match>
      return docData(matchDoc, {idField: 'id'});
    }),
    shareReplay(),
    tap(match => {
      if (match.currentMoveNumber === match.moves.length) {
        this.playerMove = undefined;
      }
    })
  )

  playerMove?: MoveEnum

  MOVE = MoveEnum;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private functions: Functions
  ) {
  }

  ngOnInit(): void {
    signInAnonymously(this.auth)
  }

  async move(move: MoveEnum, matchId?: string) {
    this.playerMove = move;
    if (!matchId) {
      return
    }
    return httpsCallable(this.functions, 'makeMove')({move, matchId})
  }
}
