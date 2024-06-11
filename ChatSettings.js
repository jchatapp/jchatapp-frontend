import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, Button, Image, ScrollView, TouchableWithoutFeedback, FlatList, ActivityIndicator  } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import axios from 'axios';
import config from './config';

const ChatSettings = ({ route, navigation }) => {
    const { userMap, userProfiles, threadId } = route.params;
    const [modalVisible, setModalVisible] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [addPeopleModalVisible, setAddPeopleModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [noUserFound, setNoUserFound] = useState(false)

    const handleCancel = () => {
      setModalVisible(false);
      setAddPeopleModalVisible(false);
      setNewGroupName('');
      setSearchQuery('');
      setSearchResults([]);
    };

    const searchUsers = async () => {
      setIsLoading(true);
      try {
          const response = await axios.get(config.API_URL + `/searchUser?username=${searchQuery}`);
          console.log(response.data)
          if (response.data.length > 0) {
              setSearchResults(response.data);
          } else {
              setSearchResults([]);  
              setNoUserFound(true);  
          }
          setIsLoading(false);
      } catch (error) {
          console.error('Search users failed:', error);
          setSearchResults([]); 
          setNoUserFound(true);  
          setIsLoading(false);
      }
  };

  useEffect(() => {
      if (searchQuery.length > 0) {
          const timer = setTimeout(() => {
              searchUsers();
          }, 500);
          return () => clearTimeout(timer);
      }
  }, [searchQuery]);

  const handleSelectUser = user => {
      // Add logic to handle adding user to the group
      console.log('User selected:', user);
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
            <TouchableOpacity onPress={() => setAddPeopleModalVisible(true)} style={styles.button}>
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
                                    changeChatName(threadId, newGroupName);
                                    handleCancel();
                                }}>
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal
            transparent={true}
            visible={addPeopleModalVisible}
            onRequestClose={() => setAddPeopleModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setAddPeopleModalVisible(false)}>
              <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                      <View style={styles.modalContent}>
                          <TextInput
                              style={styles.searchInput}
                              onChangeText={setSearchQuery}
                              value={searchQuery}
                              placeholder="Search users..."
                          />
                          {isLoading ? (
                                  <ActivityIndicator />
                              ) : noUserFound ? (
                                  <Text style={styles.noResultsText}>No user found.</Text>
                              ) : (
                                  <FlatList
                                      data={searchResults}
                                      keyExtractor={item => item.id.toString()}
                                      renderItem={({ item }) => (
                                          <TouchableOpacity onPress={() => handleSelectUser(item)}>
                                              <Text>{item.username}</Text>
                                          </TouchableOpacity>
                                      )}
                                  />
                              )}
                          <Button title="Close" onPress={() => setAddPeopleModalVisible(false)} />
                      </View>
                  </TouchableWithoutFeedback>
              </View>
          </TouchableWithoutFeedback>
      </Modal>
        </View>
    );
  };

  const changeChatName = async (threadId, newName) => {
    try {
        const response = await axios.post(config.API_URL + `/changeChatName`, {
            threadId: threadId,
            newName: newName
        });
      return response.data;
    } catch (error) {
      console.error('Failed to load older messages:', error);
    }
  };

  const addNewUser = async (threadId, userId) => {
    try {
        const response = await axios.post(config.API_URL + `/changeChatName`, {
            threadId: threadId,
            userId: userId
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
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalView: {
  margin: 20,
  backgroundColor: "white",
  borderRadius: 20,
  padding: 35,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: {
      width: 0,
      height: 2
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  width: '80%',
},
textInput: {
  height: 40,
  borderColor: 'gray',
  borderWidth: 1,
  padding: 10,
  width: '100%',
  marginBottom: 20,
},
closeButton: {
  position: 'absolute',
  right: 10,
  top: 10,
},
resultsContainer: {
  maxHeight: 200, 
},
userItem: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#ccc',
},
userName: {
  marginLeft: 10,
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  backgroundColor: 'white',
  padding: 20,
  width: '80%', // Ensure this is sufficient to see content
  maxHeight: '80%', // Limit height to ensure it's visible on screen
  borderRadius: 10,
  alignItems: "center", // Center align items inside the modal
},
searchInput: {
  height: 40,
  width: '100%', // Full width of modal content
  marginBottom: 20,
  borderWidth: 1,
  borderColor: 'gray',
  padding: 10,
  borderRadius: 5,
},

});

export default ChatSettings;