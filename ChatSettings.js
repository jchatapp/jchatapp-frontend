import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, Button, Image, ScrollView, TouchableWithoutFeedback  } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import axios from 'axios';
import config from './config';

const ChatSettings = ({ route, navigation }) => {
    const { userMap, userProfiles, threadId } = route.params;
    const [modalVisible, setModalVisible] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const handleCancel = () => {
        setModalVisible(false);
        setNewGroupName(''); 
    };

    const members = Object.keys(userMap).map(userId => ({
        name: userMap[userId],
        avatar: userProfiles[userId],
        userId: userId
    }));

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Image
              source={require('./assets/back_arrow.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
          <Text style={styles.titleText}>Details</Text>
        </View>
        <View style={styles.separatorLine}></View>
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Change group name</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}> 
              <Text style={styles.buttonText}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.separatorLine}></View> 
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Members</Text>
            <TouchableOpacity onPress={() => console.log('Change name clicked')} style={styles.button}>
              <Text style={styles.buttonText}>Add people</Text>
            </TouchableOpacity>
          </View>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.memberList}>
            {members.map((member, index) => (
              <View key={index} style={styles.memberItem}>
                <Image source={{ uri: member.avatar }} style={styles.avatar} />
                <Text style={styles.memberName}>{member.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
  
        <TouchableOpacity onPress={() => console.log('Leave chat clicked')} style={styles.leaveChat}>
          <Text style={styles.leaveChatText}>Leave chat</Text>
        </TouchableOpacity>

        <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => handleCancel()}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={styles.modalView}>
                                <TouchableOpacity style={styles.closeButton} onPress={() => handleCancel()}>
                                    <Ionicons name="close-circle" size={24} color="black" />
                                </TouchableOpacity>
                                <Text style={styles.titleText}>Change group name</Text>
                                <Text style={styles.instructionText}>
                                    Changing the name of a group chat changes it for everyone.
                                </Text>
                                <TextInput
                                    style={styles.textInput}
                                    onChangeText={setNewGroupName}
                                    value={newGroupName}
                                    placeholder="Add a name"
                                />
                                <TouchableOpacity style={styles.saveButton} onPress={() => {
                                    chageChatName(threadId, newGroupName);
                                    handleCancel();
                                }}>
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
  };

  const chageChatName = async (threadId, newName) => {
    try {
        console.log(threadId, newName)
        const response = await axios.post(config.API_URL + `/chatChatName`, {
            threadId: threadId,
            newName: newName
        });
      return response.data;
    } catch (error) {
      console.error('Failed to load older messages:', error);
    }
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingTop: 50, 
    backgroundColor: 'white',
    width: '100%',
  },
  separatorLine: {
    height: 1,           
    backgroundColor: 'gray', 
    width: '100%',     
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 15,
    padding: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  buttonText: {
    color: '#007AFF', 
    fontSize: 16,
    fontWeight: 'bold', 
},
  fullWidthSeparator: {
    height: 1,
    backgroundColor: '#ccc',
    marginBottom: 20,
    marginLeft: -20, 
    marginRight: -20, 
    width: '100%' 
  },
  membersSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  membersHeader: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  addPeople: {
    fontSize: 18,
    color: '#0000ff',
  },
  memberList: {
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 7,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  memberName: {
    flex: 1,
    fontSize: 18,
  },
  memberRole: {
    fontSize: 16,
    color: '#888',
  },
  optionsIcon: {
    fontSize: 24,
    color: '#000',
  },
  leaveChat: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  leaveChatText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  titleText: {
    fontSize: 18,
    marginHorizontal: 20,
  },
  backButton: {
    padding: 10,
    justifyContent: 'center', 
    alignItems: 'center',
    width: 44, 
    height: 44,
  },
  button: {
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#fff', 
    borderRadius: 5, 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
},
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
},
modalView: {
    width: 300, 
    backgroundColor: "white",
    borderRadius: 5,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
},
titleText: {
    fontSize: 18,
    fontWeight: 'bold',
},
closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
},
textInput: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
},
saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
},
saveButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
},
instructionText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
}

});

export default ChatSettings;