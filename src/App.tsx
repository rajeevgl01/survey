import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { studyData } from './data';
import { supabase } from './supabase';

function App() {
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [userId] = useState(() => uuidv4());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateProgress = () => {
    return (Object.keys(selections).length / studyData.length) * 100;
  };

  const selectVideo = (promptIndex: number, methodId: number) => {
    setSelections(prev => ({
      ...prev,
      [promptIndex]: methodId
    }));
  };

  const submitResponses = async () => {
    if (Object.keys(selections).length !== studyData.length) {
      alert('Please make selections for all prompts before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const responses = Object.entries(selections).map(([promptIndex, methodId]) => ({
        user_id: userId,
        prompt: studyData[Number(promptIndex)].prompt,
        selected_method: methodId,
        timestamp: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('survey_responses')
        .insert(responses);

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting responses:', error);
      alert('There was an error submitting your responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600">
            Your responses have been successfully recorded. Thank you for participating in our study.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">3D Asset Preference Study</h1>
          <p className="text-gray-600 mb-4">
            Please watch each set of videos and select the one you think best matches the given prompt. 
            Please make the selection based on image quality and semantic alignment.
          </p>
          
          <div className="bg-gray-200 rounded-full h-4 mb-8">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${updateProgress()}%` }}
            />
          </div>
        </div>

        {studyData.map((prompt, promptIndex) => (
          <div key={promptIndex} className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Prompt {promptIndex + 1}: {prompt.prompt}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {prompt.videos.map((video, videoIndex) => (
                <div 
                  key={videoIndex}
                  className={`rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selections[promptIndex] === video.method 
                      ? 'border-blue-500 shadow-lg' 
                      : 'border-gray-200'
                  }`}
                >
                  <video 
                    controls 
                    className="w-full h-48 object-cover"
                  >
                    <source src={video.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  <button
                    onClick={() => selectVideo(promptIndex, video.method)}
                    className={`w-full p-3 text-sm font-medium transition-colors duration-200 ${
                      selections[promptIndex] === video.method
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selections[promptIndex] === video.method ? 'Selected' : 'Select'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(selections).length === studyData.length && (
          <div className="fixed bottom-8 right-8">
            <button
              onClick={submitResponses}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={20} />
              {isSubmitting ? 'Submitting...' : 'Submit Responses'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;