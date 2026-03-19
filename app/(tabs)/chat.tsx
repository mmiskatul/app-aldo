import { StyleSheet, ScrollView, Platform, KeyboardAvoidingView, View } from 'react-native';
import Header from '../../components/ui/Header';
import QuickPrompts from '../../components/chat/QuickPrompts';
import ChatMessage from '../../components/chat/ChatMessage';
import InsightCard from '../../components/chat/InsightCard';
import ChatInput from '../../components/chat/ChatInput';

export default function ChatScreen() {
  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Header title="AI Chat" showBell={true} />
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <QuickPrompts />
          
          <ChatMessage 
            sender="ai" 
            message="Hello! I can help you analyze your restaurant data. What would you like to know?" 
          />
          
          <ChatMessage 
            sender="user" 
            message="Show me my revenue trend for this week." 
          />
          
          <InsightCard 
            insightText="Your dinner revenue increased by 15% this week."
            highlightText="15%"
          />
          
          <ChatMessage 
            sender="ai" 
            message="Your revenue is up 12% compared to last week. Would you like to see the breakdown by category?" 
          />
        </ScrollView>

        <ChatInput />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
