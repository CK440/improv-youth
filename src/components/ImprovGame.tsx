"use client";

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';

interface Style {
  id: number;
  name: string;
  description: string;
  color: string;
}

interface Topic {
  id: number;
  color: string;
  style_id: number;
  name: string;
  description: string;
}

interface Slide {
  id: number;
  image_url: string;
  description: string;
}

const ImprovGame = () => {
  const [currentPhase, setCurrentPhase] = useState('style');
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch random style from Supabase
  const fetchRandomStyle = async () => {
    try {
      const { data, error } = await supabase.rpc("get_random_style");
  
      if (error) throw error;
  
      if (data && data.length > 0) {
        setSelectedStyle({
          id: data[0].style_id,
          name: data[0].style_name,
          description: data[0].style_description,
          color: data[0].style_color,
        });
        setCurrentPhase("topic");
      } else {
        setError("No styles available.");
      }
    } catch (err) {
      setError("Failed to fetch style");
      console.error(err);
    }
  };
  
  
  
  

  // ✅ Fetch random topic based on the selected style
  const fetchRandomTopic = async () => {
    if (!selectedStyle) return;
  

  
    try {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("color", selectedStyle.color) // ✅ Filter by color
        .order("id", { ascending: false }) // ✅ Order by id as a workaround (RANDOM() isn't supported directly in some Supabase methods)
        .limit(1);
  
      if (error) throw error;
  
      if (data && data.length > 0) {
        setSelectedTopic(data[0]);
        await fetchRandomSlides();
        setCurrentPhase("presentation");
      } else {
        setError(`No topics available for the color: ${selectedStyle.color}`);
      }
    } catch (err) {
      setError("Failed to fetch topic");
      console.error(err);
    }
  };
  
  
  
  
  

  // ✅ Fetch 5 random slides
  const fetchRandomSlides = async () => {
    try {
      const { data, error } = await supabase
        .rpc("get_random_slides"); // ✅ Use the RPC function
  
      if (error) throw error;
  
      if (data && data.length > 0) {
        setSlides(data);
      } else {
        setError("No slides available.");
      }
    } catch (err) {
      setError("Failed to fetch slides.");
      console.error(err);
    }
  };
  
  
  

  // ✅ Timer logic for the slide presentation
  // Timer logic for slides
  useEffect(() => {
    let timer: NodeJS.Timeout;
  
    if (isPlaying && currentPhase === 'presentation') {
      timer = setTimeout(() => {
        if (currentSlideIndex < slides.length - 1) {
          setCurrentSlideIndex((prevIndex) => prevIndex + 1);
          setProgress(0); // Reset progress bar
        } else {
          // ✅ Show the "Thank You" message by changing the phase
          setIsPlaying(false);
          setCurrentPhase('end'); // Move to the "Thank You" screen
        }
      }, 20000); // 20 seconds per slide
  
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentPhase, currentSlideIndex, slides]);
  
  
  
  // ✅ Step 2: Progress bar logic to update every second
  useEffect(() => {
    let progressTimer: ReturnType<typeof setInterval>;
  
    if (isPlaying && currentPhase === "presentation") {
      progressTimer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            return 100;
          }
          return prevProgress + 5; // Increase progress every second (20 seconds total)
        });
      }, 1000); // 1-second intervals
    }
  
    return () => clearInterval(progressTimer);
  }, [isPlaying, currentPhase]);
  
  

  // ✅ Start a new game
  const startGame = () => {
    setCurrentPhase('style');
    setSelectedStyle(null);
    setSelectedTopic(null);
    setSlides([]);
    setCurrentSlideIndex(0);
    setProgress(0);
    setIsPlaying(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white text-[#0B465E] p-8">
      <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
  <img
    src="/seeds-logo.png"
    alt="Seeds Improv Logo"
    className="w-24 h-16 mr-36"
  />
  <h1 className="text-4xl font-bold text-[#0B465E]">Seeds Improv</h1>
</div>


        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

{currentPhase === 'style' && (
  <div
    className="p-6 rounded-lg mb-6"
    style={{
      background: 'linear-gradient(90deg, #17a1c7, #1B9046)',
    }}
  >
    <h2 className="text-2xl mb-4 text-white">Select Your Style</h2>
    <button
      onClick={fetchRandomStyle}
      className="bg-[#0B465E] text-white px-6 py-3 rounded-lg hover:bg-[#1B9046] transition-colors"
    >
      Generate Random Style
    </button>
  </div>
)}

{currentPhase === 'topic' && selectedStyle && (
  <div
    className="p-6 rounded-lg mb-6"
    style={{
      background: 'linear-gradient(90deg, #17a1c7, #1B9046)',
    }}
  >
    <h2 className="text-2xl mb-4 text-white">Style: {selectedStyle.name}</h2>
    <p className="mb-4 text-white">{selectedStyle.description}</p>
    <button
      onClick={fetchRandomTopic}
      className="bg-[#0B465E] text-white px-6 py-3 rounded-lg hover:bg-[#1B9046] transition-colors"
    >
      Generate Random Topic
    </button>
  </div>
)}


{currentPhase === 'presentation' && selectedStyle && selectedTopic && (
  <div className="bg-[#17a1c7] p-6 rounded-lg mb-6">
    {isPlaying && (
      <button
        onClick={startGame}
        className="absolute top-4 right-4 bg-[#0B465E] text-white px-4 py-2 rounded-lg hover:bg-[#073850] transition-colors"
      >
        Restart
      </button>
    )}
    {currentSlideIndex < slides.length ? (
      // Slide Presentation Logic
      <div>
        <h2 className="text-4xl mb-4">The Show Is Yours</h2>
        <div className="text-2xl mb-4">
        <p className="text-white"><strong>Style:</strong> {selectedStyle.name}</p>
        <p className="text-white"><strong>Topic:</strong> {selectedTopic.name}</p>
        </div>
        <div className="bg-[#0D5B5B] p-4 rounded-lg mb-4">
          <h3 className="text-xl mb-2 text-white">Slide {currentSlideIndex + 1}/{slides.length}</h3>
          {slides[currentSlideIndex] && (
            <div className="mb-4">
              <img
                src={slides[currentSlideIndex].image_url}
                alt={slides[currentSlideIndex].description}
                className="w-full h-64 object-contain rounded-lg mb-2"
              />
              
            </div>
          )}
          <Progress value={progress} className="mb-4" />
          {!isPlaying ? (
            <button
              onClick={() => setIsPlaying(true)}
              className="bg-white text-[#0B465E] px-6 py-3 rounded-lg hover:bg-[#A5CD39] transition-colors"
            >
              Start Timer
            </button>
          ) : (
            <button
              onClick={() => setIsPlaying(false)}
              className="bg-white text-[#0B465E] px-6 py-3 rounded-lg border border-[#0B465E] transition-none"
              style={{ boxShadow: 'none' }}

  
            >
              Pause Timer
            </button>
          )}
        </div>
      </div>
    ) : (
      // Thank You Screen Logic
      <div className="bg-[#1B9046] p-6 rounded-lg mb-6 text-center">
        <h2 className="text-3xl font-bold mb-4 text-white">Thank You for Giving It Your Best!</h2>
        <p className="text-lg text-white">We hope you had fun. Ready to go again?</p>
        <button
          onClick={startGame}
          className="bg-[#0B465E] text-white px-6 py-3 mt-4 rounded-lg hover:bg-[#A5CD39] transition-colors"
        >
          Start a New Game
        </button>
      </div>
    )}
  </div>
)}

{currentPhase === 'end' && (
  <div className="bg-[#1B9046] p-6 rounded-lg mb-6 text-center">
    <h2 className="text-3xl font-bold mb-4 text-white">Thank You for Giving It Your Best!</h2>
    <p className="text-lg text-white">We hope you had fun. Ready to go again?</p>
    <button
      onClick={startGame}
      className="bg-[#0B465E] text-white px-6 py-3 mt-4 rounded-lg hover:bg-[#A5CD39] transition-colors"
    >
      Start a New Game
    </button>
  </div>
)}




        
      </div>
    </div>
  );
};

export default ImprovGame;
