// // mobile/screens/HomeScreen.js
// import React from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import styles from '../styles/HomeStyles';
// import SwipeDeck from '../components/SwipeDeck'; // whatever you call it

// export default function HomeScreen({ onOpenProfile }) {
//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <View style={styles.logoDot}>
//             <Text style={styles.logoDotText}>6°</Text>
//           </View>
//           <View>
//             <Text style={styles.headerTitle}>For you</Text>
//             <Text style={styles.headerSubtitle}>People one hop away</Text>
//           </View>
//         </View>

//         <TouchableOpacity style={styles.headerRightButton} onPress={onOpenProfile}>
//           <Text style={styles.headerRightButtonText}>Profile</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.content}>
//         {/* your cards / swipe component */}
//         <SwipeDeck />
//       </View>
//     </View>
//   );
// }
