import React from 'react';
import { Button } = '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Save, 
  Trash2, 
  ArrowLeft,
  Clock,
  FileAudio,
  Download,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { MyAIInvoicesLogo } from '../MyAIInvoicesLogo';

interface Recording {
  id: string;
  title: string;
  duration: number;
  date: string;
  size: string;
  url?: string;
}

interface VoiceRecorderPageProps {
  onBack?: () => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onPauseRecording?: () => void;
  onPlayRecording?: () => void;
  onSaveRecording?: (title: string) => void;
  onDeleteRecording?: () => void;
  onDeleteSavedRecording?: (id: string) => void;
  onPlaySavedRecording?: (id: string) => void;
  
  // Recording state
  isRecording?: boolean;
  isPaused?: boolean;
  isPlaying?: boolean;
  hasRecording?: boolean;
  duration?: number;
  isSaving?: boolean;
  
  // Audio settings
  volume?: number;
  isMuted?: boolean;
  
  // Saved recordings
  savedRecordings?: Recording[];
  
  // Permission status
  permissionStatus?: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export function VoiceRecorderPage({
  onBack,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onPlayRecording,
  onSaveRecording,
  onDeleteRecording,
  onDeleteSavedRecording,
  onPlaySavedRecording,
  
  isRecording = false,
  isPaused = false,
  isPlaying = false,
  hasRecording = false,
  duration = 0,
  isSaving = false,
  
  volume = 100,
  isMuted = false,
  
  savedRecordings = [],
  permissionStatus = 'unknown'
}: VoiceRecorderPageProps) {
  const [recordingTitle, setRecordingTitle] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'record' | 'library'>('record');
  const [playingRecordingId, setPlayingRecordingId] = React.useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSaveRecording = () => {
    const title = recordingTitle.trim() || `Recording ${new Date().toLocaleString()}`;
    onSaveRecording?.(title);
    setRecordingTitle('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="bg-white/80 backdrop-blur-sm border border-white/30 hover:bg-white/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center gap-3">
              <MyAIInvoicesLogo height={40} />
              <div>
                <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Voice Recorder
                </h1>
                <p className="text-gray-600">Record and manage your voice memos</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-white/30">
            <Button
              variant={activeTab === 'record' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('record')}
              className={activeTab === 'record' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                : 'text-gray-600 hover:text-gray-800'
              }
            >
              <Mic className="w-4 h-4 mr-2" />
              Record
            </Button>
            <Button
              variant={activeTab === 'library' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('library')}
              className={activeTab === 'library' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                : 'text-gray-600 hover:text-gray-800'
              }
            >
              <FileAudio className="w-4 h-4 mr-2" />
              Library ({savedRecordings.length})
            </Button>
          </div>
        </div>

        {activeTab === 'record' ? (
          <div className="space-y-6">
            {/* Recording Status */}
            {permissionStatus === 'denied' && (
              <Card className="border-red-200 bg-red-50/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mic className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-red-800 mb-2">Microphone Access Required</h3>
                    <p className="text-red-600 text-sm mb-4">
                      Please allow microphone access in your browser to use the voice recorder.
                    </p>
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      Enable Microphone
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {permissionStatus === 'granted' && (
              <Card className="border-green-200 bg-green-50/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-800">Microphone ready</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Recording Interface */}
            <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
              
              <CardContent className="relative pt-8 pb-8">
                <div className="text-center space-y-6">
                  {/* Duration Display */}
                  <div className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/30">
                    <Clock className="w-6 h-6 text-gray-500" />
                    <span className="font-mono text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {formatDuration(duration)}
                    </span>
                  </div>

                  {/* Recording Status */}
                  {isRecording && (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse" />
                      <span className="text-gray-700 font-medium">
                        {isPaused ? 'Recording Paused' : 'Recording...'}
                      </span>
                    </div>
                  )}

                  {/* Audio Visualizer Placeholder */}
                  {isRecording && !isPaused && (
                    <div className="flex items-center justify-center gap-1 h-16">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 60 + 10}px`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Control Buttons */}
                  <div className="flex items-center justify-center gap-4">
                    {!isRecording ? (
                      <Button
                        onClick={onStartRecording}
                        disabled={permissionStatus === 'denied'}
                        size="lg"
                        className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-2xl transform hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
                      >
                        <Mic className="w-8 h-8" />
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={onPauseRecording}
                          variant="outline"
                          size="lg"
                          className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm border-2 border-white/50 hover:bg-white/90 transform hover:scale-105 transition-all duration-200"
                        >
                          {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                        </Button>
                        <Button
                          onClick={onStopRecording}
                          size="lg"
                          className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-xl transform hover:scale-105 transition-all duration-200"
                        >
                          <Square className="w-6 h-6" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center justify-center gap-4 bg-white/60 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                    <div className="w-32">
                      <Progress value={volume} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{volume}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Playback and Save Controls */}
            {hasRecording && (
              <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileAudio className="w-5 h-5 text-blue-500" />
                    Current Recording
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-700">Recording Title</Label>
                    <Input
                      id="title"
                      value={recordingTitle}
                      onChange={(e) => setRecordingTitle(e.target.value)}
                      placeholder={`Recording ${new Date().toLocaleString()}`}
                      className="bg-white/60 backdrop-blur-sm border border-white/30 focus:bg-white/80 transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      onClick={onPlayRecording}
                      variant="outline"
                      className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={onDeleteRecording}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-red-50/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleSaveRecording}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save Recording'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Recording Library */
          <div className="space-y-6">
            {savedRecordings.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileAudio className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-gray-800 mb-2">No recordings yet</h3>
                  <p className="text-gray-600 mb-6">Start recording to build your voice memo library</p>
                  <Button
                    onClick={() => setActiveTab('record')}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {savedRecordings.map((recording) => (
                  <Card key={recording.id} className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <FileAudio className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{recording.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(recording.duration)}
                              </span>
                              <span>{formatDate(recording.date)}</span>
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                {recording.size}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => onPlaySavedRecording?.(recording.id)}
                            variant="outline"
                            size="sm"
                            className="bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80"
                          >
                            {playingRecordingId === recording.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => onDeleteSavedRecording?.(recording.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-red-50/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}