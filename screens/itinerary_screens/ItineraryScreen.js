import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  FlatList,
  Modal,
  Pressable,
  TextInput,
} from "react-native";
import CalendarStrip from "react-native-calendar-strip";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  addDoc,
  Firestore,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./../../Config";

const ItineraryScreen = ({ navigation }) => {
  // states used by the itinerary
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [formattedDate, setFormattedDate] = useState();
  const [startDate, setStartDate] = useState(); // change this to make the calendar strip start at correct date
  const [tripStartDate, setTripStartDate] = useState();
  const [tripEndDate, setTripEndDate] = useState();
  const [events, setEvents] = useState([]); // array of event maps for all dates (should include date, time, and description)
  const [selectedEvents, setSelectedEvents] = useState([]); // array of event maps for selected date
  const [markedDates, setMarkedDates] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // setup for getting current user's ID:
  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user.uid;

  // Firestore document reference
  const userSchedDocRef = doc(db, "GenSchedules", uid);
  const userSurveyDocRef = doc(db, "UserQuestionnaireAnswers", uid); // for getting questionnaire data

  // get all user's events from database (might run after each rerender?)
  useEffect(() => {
    createSchedDoc(); // create user's doc if not already created
    getTripStartEndDates(); // get trip start/end dates from survey (try getting these before calendar strip renders somehow)
    getEventsFromDatabase(); // get events from database (from user's doc)
  }, []);

  const createSchedDoc = () => {
    setDoc(userSchedDocRef, {}, { merge: true })
      .then(() => {
        //alert("Document Created/Updated");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const addEventToDatabase = () => {
    const data = {
      title: newTitle,
      time: newTime,
      date: newDate,
      // add id?
    };
    const newEventsArray = [...events, data];
    updateDoc(userSchedDocRef, { events: newEventsArray }, { merge: true })
      .then(() => {
        alert("Event added");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  // function to get events for date selected from database
  const getEventsFromDatabase = () => {
    // function should take date as parameter
    getDoc(userSchedDocRef).then((doc) => {
      console.log("Getting events...");
      setEvents(doc.get("events")); // gets the array of maps from database
      console.log(events);
    });
  };

  // function to get vacation start and end dates (to pass to calendar strip)
  const getTripStartEndDates = () => {
    getDoc(userSurveyDocRef).then((doc) => {
      console.log("Getting trip start and end dates...");
      setTripStartDate(doc.get("startDate"));
      setTripEndDate(doc.get("endDate"));

      // for testing, show uid and start/end dates
      console.log(uid);
      console.log(doc.get("startDate"));
      console.log(doc.get("endDate"));
    });
  };

  const getEventsForDay = (formDate) => {
    // WONT WORK, GETS OLD selectedDate STATE, FIGURE OUT HOW TO GET MOST RECENT STATE
    if (events == undefined) {
      alert("No events created at all!"); // user hasn't added any events yet
    } else {
      const eventObjectsForDay = events.filter(
        (event) => event.date === formDate
      );
      console.log("selectedDate state: ", selectedDate);
      console.log("\nEvent Objects for selected day:\n", eventObjectsForDay);
      setSelectedEvents(eventObjectsForDay);
    }
  };

  // function called when date is selected from calendar strip
  const onDateSelected = (date) => {
    console.log("\ndate variable: ", date);
    console.log("old selectedDate state: ", selectedDate);
    const formDate = date.format("MM/DD/YYYY");
    setSelectedDate(formDate);
    getEventsForDay(formDate);
    //console.log("new selectedDate state: ", selectedDate); this wont work because state is async, wont update immediately
  };

  // List Item component, renders each event in the agenda list
  const ListItem = ({ event }) => {
    // each event is one object from the events array
    console.log(event); // shows each event object

    return (
      <View>
        <TouchableOpacity style={styles.eventcontainer}>
          <Text>date: {event.item.date}</Text>
          <Text>time: {event.item.time}</Text>
          <Text>description: {event.item.description}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // main return
  return (
    <View style={styles.maincontainer}>
      <CalendarStrip
        scrollable={false}
        calendarAnimation={{ type: "parallel", duration: 600 }}
        daySelectionAnimation={{
          type: "background",
          duration: 300,
          highlightColor: "#9265DC",
        }}
        style={{ height: 120, paddingTop: 20, paddingBottom: 10 }}
        calendarHeaderStyle={{ color: "black" }}
        calendarColor={"#FFD56D"}
        dateNumberStyle={{ color: "black" }}
        dateNameStyle={{ color: "black" }}
        iconContainer={{ flex: 0.1 }}
        highlightDateNameStyle={{ color: "white" }}
        highlightDateNumberStyle={{ color: "white" }}
        highlightDateContainerStyle={{ backgroundColor: "black" }}
        markedDates={markedDates}
        selectedDate={selectedDate}
        onDateSelected={onDateSelected}
        useIsoWeekday={true}
        startingDate={tripStartDate}
        minDate={tripStartDate}
        maxDate={tripEndDate}
      />

      <Text style={{ fontSize: 24 }}>Selected Date: {selectedDate}</Text>

      <View>
        <FlatList
          data={selectedEvents}
          renderItem={(item) => <ListItem event={item} />}
        />
      </View>

      <TouchableOpacity
        style={styles.addeventbutton}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={33} color="black" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{ fontSize: 19, fontWeight: "bold" }}>
              Enter new event details:
            </Text>
            <TextInput
              style={styles.textbox}
              onChangeText={setNewTitle}
              value={newTitle}
              placeholder="Enter title..."
            />
            <TextInput
              style={styles.textbox}
              onChangeText={setNewDate}
              value={newDate}
              placeholder="Enter date (MM/DD/YYYY)"
            />
            <TextInput
              style={styles.textbox}
              onChangeText={setNewTime}
              value={newTime}
              placeholder="Enter time (HH:MM:SS AM/PM)"
            />
            <View style={styles.modalbuttonsview}>
              <TouchableOpacity
                style={styles.modalbutton}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalbutton}
                onPress={() => [addEventToDatabase(), setModalVisible(false)]}
              >
                <Text>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
  },
  eventcontainer: {
    backgroundColor: "#FFD56D",
    borderRadius: 7,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  addeventbutton: {
    backgroundColor: "#6D97FF",
    borderRadius: 25,
    height: 70,
    width: 70,
    position: "absolute",
    top: "87%",
    left: "77%",
    paddingTop: 18,
    paddingLeft: 18,
    elevation: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 56,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    height: "88%",
    width: "90%",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalbuttonsview: {
    flexDirection: "row",
    //backgroundColor: "red",
  },
  modalbutton: {
    backgroundColor: "#FFD56D",
    height: 40,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    margin: 5,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  textbox: {
    backgroundColor: "gainsboro",
    height: 40,
    width: "90%",
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default ItineraryScreen;
