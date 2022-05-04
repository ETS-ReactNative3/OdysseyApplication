
import React, {useState} from 'react';
import { Platform, StyleSheet,Text,View,TextInput, KeyboardAvoidingView, Keyboard, TouchableOpacity, ScrollView, FlatList, Alert} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { db } from "../Config";
import { getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from 'moment'; 
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
import { TextPath } from 'react-native-svg';


const BudgetPlannerV2 = ()=>{
    const [textInput, setTextInput]  = React.useState('');
    const [costInput, setCostInput] = React.useState('');
    const [dateInput, setDateInput] = React.useState('');
    const [Costs, setCosts] = React.useState([]);
    const [Expenses,setExpenses] = React.useState([]);
    const [Dates, setDates] = React.useState([]);
    const [toggleSubmit, setToggleSubmit] = useState(true);
    const [isEditItem, setIsEditItem] = useState(null);
    const [userDoc, setUserDoc] = useState(null);
    const [text, setText] = useState("");

    const auth = getAuth();
    const user = auth.currentUser;
    const uid = user.uid;

    const myDoc = doc(db, "BudgetPlanner", uid);
    const docRef = doc(db, "BudgetPlanner", uid);
    const docBudgetRef = doc(db, "UserQuestionnaireAnswers", uid);

    const addPreviousExpenses = () => {
        getDoc(docRef)
        .then((doc) => {  
            setExpenses(doc.get("Expenses"));
            }
        )
    };

    const createDoc = async () => {
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          const docRef = doc(db, "BudgetPlanner", uid);
          const docData = {
            Expenses: [],
          };
          setDoc(docRef, docData);
        }
      };

      React.useEffect(() => {
        addPreviousExpenses()
      }, [])

      React.useEffect(() => {
        createDoc()
      }, [])

      const convertSecToDate = (sec) => {
        console.log (sec)
        //var t = new Date(1970, 0, 1) // Epoch
        //t.setSeconds(sec)
        //console.log(t)
        //return t2;
      }

      const getMonthName = (num) => {
        var monthNames = ["January", "February", "March", "April", "May","June","July", "August", "September", "October", "November","December"];
        return monthNames[num + 1]
      }


    const ListItem = ({expense}) => {
        console.log(expense)
        return (
        <View style = {styles.listItem}>
            {/*The view that holds the expense */}
            <View style = {{flex: 1,flexDirection:"row"}}>
                {/*The text for the expense and cost*/}
                <Text style = {{fontWeight: "bold", fontSize: 15, color: "#000",}}>
                    {
                    expense.Expenses
                    
                    }
                    
                </Text>
                <Text style = {{fontWeight: "bold", fontSize: 15, color: "#000", paddingHorizontal:20}}>
                    {
                    "$" + expense.Costs
                    }
                </Text>
                <Text style = {{fontWeight: "bold", fontSize: 15, color: "#000", paddingHorizontal:20}}>
                    {
                        //getMonthName(convertSecToDate(expense.Dates.seconds).getDay()) + " " + convertSecToDate(expense.Dates.seconds).getDate()  + ", " + convertSecToDate(expense.Dates.seconds).getFullYear()
                        //expense.Dates
                        //convertSecToDate(expense.Dates)
                        expense.Dates
                        
                    }
                </Text>
            </View>

            {/*Done and Delete buttons*/}
            <TouchableOpacity style = {[styles.actionIcon]} onPress={()=>{deleteExpense(expense?.id)}}>
                <Icon name = "delete" size = {20} color = "black"/>
            </TouchableOpacity>
            
        
            {/* Attempt at edit. */}
            <TouchableOpacity style = {[styles.actionIcon]} onPress = {()=> {editExpense(expense?.id) }}>
                <Icon name = "edit" size = {20} color = "black"/>
            </TouchableOpacity>
            { 
        }
        </View>
        );
    };

    {/*Add expense, mark expense done, edit expense, and delete expense functions*/}
    const addExpense = () => {
        //gets users doc then updates it after user adds a todo.
        if(textInput == "" || costInput == ""){
            Alert.alert("Error", "Please input an Expense and Cost");

        //For editing expense
        }if (textInput && !toggleSubmit){
            setExpenses(
                Expenses.map((expense) => {
                    if(expense.id === isEditItem){
                        return{...expense, Expenses:textInput, Costs:costInput}
                    }
                    return expense;
                })
            );
            set
            setToggleSubmit(true);
            setTextInput('');
            setCostInput('');
            setIsEditItem(null);
           
        }
        //adding brand new expense

        if (toggleSubmit){
            
            const newExpenses = {
                id:Math.random(),
                Expenses: textInput,
                Costs: costInput,
                //Dates: new Date().toLocaleString()
                Dates: moment().format("DD/MM/YYYY")
                
            };
            console.log(newExpenses.Dates),

            setExpenses([...Expenses,newExpenses]);
            setTextInput('');
            setCostInput('');
            const recentExpenseList = [...Expenses,newExpenses];


            getDoc(docRef)
            .then((doc) => {  
                if (!doc.exists) {
                    console.log('No such document!');
                } else {
                    updateDoc(docRef, {Expenses: recentExpenseList}, {merge:true});
                }
            })
        }
        updateDoc(docRef, {Expenses:Expenses}, {Costs:Costs}, {Dates:Dates}, {merge:true});
    };


    const deleteExpense = (expenseId) => {
        //filters out selected expense and removes it
        const newExpenses = Expenses.filter(expense => expense.id != expenseId);
        setExpenses(newExpenses);
        updateDoc(docRef, {Expenses: newExpenses}, {merge:true});
    }

    const editExpense= (expenseId) => {
        let newEditItem = Expenses.find((expense) => {
            return expense.id === expenseId
        });
        setToggleSubmit(false);
        setTextInput(newEditItem.Expenses);
        setCostInput(newEditItem.Costs);
        setCosts(newEditItem.Costs);
        setIsEditItem(expenseId);
        setExpenses(Expenses);
        updateDoc(docRef, {Expenses:Expenses}, {merge:true});
    };
    const totalCost = ({expense}) => {
        totalExpenseCost += expense.Costs;
        return totalExpenseCost;

    }

    return( 
    <SafeAreaView
        style= {{flex: 1, backgroundColor: "#fff",}}>
            <View style = {styles.header}>
                <Text style={styles.sectionTitle}>Budget Planner</Text>
            </View>

            <FlatList
                showsVerticalScrollIndicator = {false}
                contentContainerStyle = {{padding: 20, paddingBottom: 100}}
                data = {Expenses} 
                renderItem = {({item}) => <ListItem expense = {item}/>}
            />
            

            <View style = {styles.footer}>
                <View style = {styles.inputContainer}>
                    <TextInput
                        value={textInput}
                        placeholder = "Write an Expense"
                        onChangeText={text => setTextInput(text)}
                    />
                </View>

                <View style = {styles.inputContainer}>
                    <TextInput
                        value={costInput}
                        placeholder = "Cost"
                        onChangeText={text => setCostInput(text)}
                    />
                </View>
                
                <TouchableOpacity onPress={addExpense}>
                    <View style = {styles.iconContainer}>
                        <Text style={styles.addText}> + </Text>
                    </View>
                </TouchableOpacity>
            </View>


    </SafeAreaView>
    );
};
  
const styles = StyleSheet.create({
    actionIcon: {
        height: 25,
        width: 25,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 5,
    },
    listItem: {
        padding: 20,
        backgroundColor: '#FFD56D',
        flexDirection: "row",
        elevation: 12,
        borderRadius: 7,
        marginVertical: 10,
        justifyContent: 'space-evenly'
    },
    header:{
        padding: 10,
        flexDirection: "row",
        alignItems:"center",
        justifyContent: "center"
    },

    sectionTitle:{
        fontSize: 24,
        fontWeight: "bold",
        alignSelf: "center",
    },

    footer:{
        position: 'absolute',
        bottom: 0,
        backgroundColor: "#fff",
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    inputContainer:{
        elevation: 40,
        flex: 1,
        height: 50,
        marginVertical: 20,
        marginRight: 20,
        borderRadius: 30,
        paddingHorizontal: 20,
        justifyContent: 'center',
        backgroundColor: "#C4C4C4",
    },

    iconContainer:{
        height: 50,
        width: 50,
        backgroundColor: "#C4C4C4",
        borderRadius: 25,
        elevation: 40,
        justifyContent: "center",
        alignItems: "center",
    },

    addText:{
        fontSize: 24,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default BudgetPlannerV2;