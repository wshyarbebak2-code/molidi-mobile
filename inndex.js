import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// Must be exported or imported for the router to work
registerRootComponent(() => <ExpoRoot />);
