// Entrada de la app: expo-router + el handler del widget de Android.
import 'expo-router/entry';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './widgets/handler';

registerWidgetTaskHandler(widgetTaskHandler);
