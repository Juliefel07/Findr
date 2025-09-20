import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  increment,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { Provider } from "react-native-paper";
import { db } from "../../firebase/config";

export default function Home() {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Editing states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editStatusId, setEditStatusId] = useState(null);

  // Menu state
  const [menuVisible, setMenuVisible] = useState(null); // stores status id for menu open

  // Comments
  const [activeCommentStatusId, setActiveCommentStatusId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const reactionTypes = [
    { key: "like", icon: "thumbs-up-outline" },
    { key: "love", icon: "heart-outline" },
    { key: "laugh", icon: "happy-outline" },
  ];

  // Load statuses
  useEffect(() => {
    const colRef = collection(db, "statuses");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setStatuses(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading statuses:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Load comments for active status
  useEffect(() => {
    if (!activeCommentStatusId) {
      setComments([]);
      return;
    }

    const commentsRef = collection(db, "comments");
    const q = query(
      commentsRef,
      where("statusId", "==", activeCommentStatusId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setComments(items);
      },
      (error) => {
        console.error("Error loading comments:", error);
      }
    );

    return () => unsubscribe();
  }, [activeCommentStatusId]);

  // Add or Edit Status handler
  const handleSaveStatus = async () => {
    if (!newStatus.trim()) return;

    try {
      if (isEditMode) {
        // Edit mode - update doc
        const statusDocRef = doc(db, "statuses", editStatusId);
        await updateDoc(statusDocRef, {
          text: newStatus.trim(),
          // optionally update updatedAt if you want
          updatedAt: serverTimestamp(),
        });
      } else {
        // Add new status
        await addDoc(collection(db, "statuses"), {
          text: newStatus.trim(),
          reactions: {},
          commentsCount: 0,
          createdAt: serverTimestamp(),
        });
      }

      // Reset modal & states
      setNewStatus("");
      setModalVisible(false);
      setIsEditMode(false);
      setEditStatusId(null);
    } catch (error) {
      console.error("Error saving status:", error);
    }
  };

  // Delete Status handler
  const handleDeleteStatus = async (statusId) => {
    try {
      await deleteDoc(doc(db, "statuses", statusId));
      if (activeCommentStatusId === statusId) {
        setActiveCommentStatusId(null);
      }
      if (menuVisible === statusId) {
        setMenuVisible(null);
      }
    } catch (error) {
      console.error("Error deleting status:", error);
    }
  };

  // Toggle menu open/close for a status
  const toggleMenu = (statusId) => {
    if (menuVisible === statusId) {
      setMenuVisible(null);
    } else {
      setMenuVisible(statusId);
    }
  };

  // Open Edit modal with selected status
  const openEditModal = (status) => {
    setIsEditMode(true);
    setEditStatusId(status.id);
    setNewStatus(status.text);
    setModalVisible(true);
    setMenuVisible(null); // close menu
  };

  // Reaction handler
  const handleReact = async (statusId, reactionKey) => {
    const statusDocRef = doc(db, "statuses", statusId);
    try {
      await updateDoc(statusDocRef, {
        [`reactions.${reactionKey}`]: increment(1),
      });
    } catch (error) {
      console.error("Error reacting to status:", error);
    }
  };

  // Toggle comment section
  const toggleCommentSection = (statusId) => {
    if (activeCommentStatusId === statusId) {
      setActiveCommentStatusId(null);
      setNewComment("");
    } else {
      setActiveCommentStatusId(statusId);
      setNewComment("");
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !activeCommentStatusId) return;

    try {
      await addDoc(collection(db, "comments"), {
        statusId: activeCommentStatusId,
        text: newComment.trim(),
        createdAt: serverTimestamp(),
      });

      // Increment commentsCount on status document
      const statusDocRef = doc(db, "statuses", activeCommentStatusId);
      await updateDoc(statusDocRef, {
        commentsCount: increment(1),
      });

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <Provider>
      <LinearGradient
        colors={["#031630ff", "#4375a7ff", "#829dc0ff"]}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={styles.header}>Status Feed</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <ScrollView style={{ flex: 1 }}>
              {statuses.length === 0 && (
                <Text
                  style={{ textAlign: "center", marginTop: 20, color: "white" }}
                >
                  No statuses yet. Add one!
                </Text>
              )}
              {statuses.map((status) => (
                <View key={status.id} style={styles.statusCard}>
                  <Text style={styles.statusText}>{status.text}</Text>

                  {/* 3-dots menu button above comment */}
                  <View style={styles.menuContainer}>
                    <TouchableOpacity onPress={() => toggleMenu(status.id)}>
                      <Ionicons
                        name="ellipsis-vertical"
                        size={24}
                        color="white"
                      />
                    </TouchableOpacity>

                    {menuVisible === status.id && (
                      <View style={styles.menu}>
                        <TouchableOpacity
                          onPress={() => openEditModal(status)}
                          style={styles.menuItem}
                        >
                          <Text style={styles.menuText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteStatus(status.id)}
                          style={styles.menuItem}
                        >
                          <Text style={styles.menuText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  <View style={styles.reactionsRow}>
                    {reactionTypes.map(({ key, icon }) => (
                      <TouchableOpacity
                        key={key}
                        style={styles.reactionButton}
                        onPress={() => handleReact(status.id, key)}
                      >
                        <Ionicons name={icon} size={22} color="white" />
                        <Text style={styles.reactionCount}>
                          {status.reactions?.[key] || 0}
                        </Text>
                      </TouchableOpacity>
                    ))}

                    {/* Comment button below menu */}
                    <TouchableOpacity
                      style={{
                        marginLeft: "auto",
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 6,
                      }}
                      onPress={() => toggleCommentSection(status.id)}
                    >
                      <Ionicons
                        name="chatbubble-outline"
                        size={22}
                        color="white"
                      />
                      <Text style={[styles.reactionCount, { marginLeft: 4 }]}>
                        {status.commentsCount || 0}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Comments section */}
                  {activeCommentStatusId === status.id && (
                    <View style={styles.commentsSection}>
                      <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                        {comments.length === 0 && (
                          <Text style={styles.noCommentsText}>No comments yet</Text>
                        )}
                        {comments.map((comment) => (
                          <View key={comment.id} style={styles.comment}>
                            <Ionicons
                              name="person-circle-outline"
                              size={20}
                              color="white"
                            />
                            <Text style={styles.commentText}>{comment.text}</Text>
                          </View>
                        ))}
                      </ScrollView>

                      <View style={styles.addCommentRow}>
                        <TextInput
                          style={styles.commentInput}
                          placeholder="Add a comment..."
                          placeholderTextColor="#ccc"
                          value={newComment}
                          onChangeText={setNewComment}
                          multiline={false}
                          autoFocus
                        />
                        <TouchableOpacity
                          style={styles.sendButton}
                          onPress={handleAddComment}
                        >
                          <Ionicons name="send" size={22} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}

          {/* Add Status Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setModalVisible(true);
              setIsEditMode(false);
              setNewStatus("");
              setEditStatusId(null);
              setMenuVisible(null);
            }}
          >
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>

          {/* Modal for Add/Edit Status */}
          <Modal visible={modalVisible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {isEditMode ? "Edit Status" : "New Status"}
                </Text>

                <TextInput
                  style={[styles.input, { height: 100 }]}
                  placeholder="What's on your mind?"
                  value={newStatus}
                  onChangeText={setNewStatus}
                  multiline
                  autoFocus
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                      setNewStatus("");
                      setIsEditMode(false);
                      setEditStatusId(null);
                    }}
                    style={[styles.button, { backgroundColor: "gray" }]}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveStatus}
                    style={[styles.button, { backgroundColor: "#007AFF" }]}
                  >
                    <Text style={styles.buttonText}>
                      {isEditMode ? "Save" : "Post"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </LinearGradient>
    </Provider>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Cursive",
    color: "white",
  },
  statusCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    position: "relative", // important for menu positioning
  },
  statusText: {
    color: "white",
    fontSize: 16,
    marginBottom: 12,
  },
  reactionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reactionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  reactionCount: {
    color: "white",
    marginLeft: 6,
    fontWeight: "600",
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "90%",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: { color: "white", fontWeight: "bold" },

  commentsSection: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 8,
  },
  noCommentsText: {
    color: "#ccc",
    fontStyle: "italic",
    marginBottom: 8,
  },
  comment: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  commentText: {
    color: "white",
    marginLeft: 6,
    fontSize: 14,
  },
  addCommentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    color: "white",
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Menu styles
  menuContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  menu: {
    position: "absolute",
    top: 28,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 6,
    paddingVertical: 6,
    width: 100,
    elevation: 6,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuText: {
    color: "white",
    fontSize: 14,
  },
});
