// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
import * as functions from 'firebase-functions';

// The Firebase Admin SDK to access Firebase Features from within Cloud Functions.
import * as admin from 'firebase-admin';
import {ASharedInterface, Match, MATCH_COLLECTION, matchCheck, Move} from '@rps-firebase/shared';

admin.initializeApp();

// Set up extra settings. Since May 29, 2020, Firebase Firebase Added support for
// calling FirebaseFirestore.settings with { ignoreUndefinedProperties: true }.
// When this parameter is set, Cloud Firestore ignores undefined properties
// inside objects rather than rejecting the API call.
admin.firestore().settings({
  ignoreUndefinedProperties: true,
});

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.region('europe-west6').https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', {structuredData: true});
  const something: ASharedInterface = {
    name: 'Phong Firebase Function',
    isSomething: true,
    amount: 6
  };
  response.send(something);
});

export const getMatch = functions.region('europe-west6').https.onCall(async (data, context) => {
  const userUid = context.auth?.uid;

  if (!userUid) {
    return
  }

  const matchDocs = await admin.firestore()
    .collection(MATCH_COLLECTION)
    .where('isOpen', '==', true)
    .limit(1)
    .get();
  const openMatchDoc = matchDocs.docs[0];

  // No Match found
  if (!openMatchDoc) {
    const newMatch: Match = {
      isOpen: true,
      creator: userUid,
      opponent1: userUid,
      currentMoveNumber: 0,
      moves: [],
    }
    const newMatchDoc = await admin.firestore().collection(MATCH_COLLECTION).add(newMatch)
    await admin.firestore()
      .collection(MATCH_COLLECTION)
      .doc(newMatchDoc.id)
      .collection('Moves')
      .doc('0')
      .set({moveNumber: 0})
    return newMatchDoc.id;
  }

  const openMatch = openMatchDoc.data() as Match;
  // Open match from the requested player found
  if (openMatch.creator === userUid) {
    return openMatchDoc.id;
  }

  // Open match from another player found
  await openMatchDoc.ref.update({
    opponent2: userUid,
    isOpen: false
  } as Partial<Match>);
  return openMatchDoc.id;

});

export const makeMove = functions.region('europe-west6').https.onCall(async (data, context) => {
  const userUid = context.auth?.uid;
  if (!userUid) {
    return
  }

  const {move, matchId} = data;

  const matchDocRef = admin.firestore().collection(MATCH_COLLECTION).doc(matchId)
  const matchDoc = await matchDocRef.get()
  const match = matchDoc.data() as Match

  if (match.winner) { // Match is already over -> End Function
    return
  }

  // Player move update
  const isOpponent1 = match.opponent1 === userUid
  const update = isOpponent1 ? {opponent1: move} : {opponent2: move}
  const moveDocRef = admin.firestore()
    .collection(MATCH_COLLECTION)
    .doc(matchId)
    .collection('Moves')
    .doc('' + match.currentMoveNumber)
  await moveDocRef.update(update)


  const moveDoc = await moveDocRef.get()
  const moveDocData = moveDoc.data() as Move
  const {opponent1: opponent1Move, opponent2: opponent2Move} = moveDocData

  // Waiting for Player to move -> End Function
  if (!opponent1Move || !opponent2Move) {
    return
  }

  const matchWinner = matchCheck(opponent1Move, opponent2Move);
  const currentMoveNumber = match.currentMoveNumber + 1

  if (matchWinner === 'tie') {
    await matchDocRef.update({
      moves: [
        ...match.moves,
        {
          opponent1: moveDocData.opponent1,
          opponent2: moveDocData.opponent2,
          moveNumber: match.currentMoveNumber
        }
      ],
      currentMoveNumber
    } as Partial<Match>)
    await admin.firestore()
      .collection(MATCH_COLLECTION)
      .doc(matchId)
      .collection('Moves')
      .doc('' + currentMoveNumber)
      .set({moveNumber: currentMoveNumber})

    return
  }

  await matchDocRef.update({
    moves: [
      ...match.moves,
      {
        opponent1: moveDocData.opponent1,
        opponent2: moveDocData.opponent2,
        moveNumber: match.currentMoveNumber
      }
    ],
    currentMoveNumber,
    winner: match[matchWinner]
  } as Partial<Match>)

  return
});
