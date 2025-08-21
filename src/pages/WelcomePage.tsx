import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Star, Shield, Clock, Users, Zap } from 'lucide-react';

interface WelcomePageProps {
  onEnterGarage: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onEnterGarage }) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/BMW M3 Competition - 4K Cinematic Short Video.mp4" type="video/mp4" />
        {/* Fallback background image if video fails to load */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2942&q=80')`
          }}
        />
      </video>
      
      {/* Video overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 md:p-8">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-600 p-2 rounded-lg">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <div>
                          <h1 className="text-2xl md:text-3xl font-bold text-white">Shahi Multi Car Care</h1>
            <p className="text-orange-200 text-sm">Engine • Suspension • Scanning • AC Works</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Hero Text */}
              <div className="text-center lg:text-left">
                <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                  Your Car's
                  <span className="text-orange-400 block">Complete Care</span>
                </h2>
                <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                  Expert automotive services specializing in Engine, Suspension, Scanning & AC Works. 
                  We repair all types of cars with professional expertise.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    onClick={onEnterGarage}
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    Enter Garage
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white text-black bg-white hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                  >
                    Learn More
                  </Button>
                </div>
              </div>

              {/* Right Column - Features */}
              <div className="grid gap-4">
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-white">
                      <Star className="h-5 w-5 text-orange-400 mr-3" />
                      Premium Service
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-200">
                      Expert technicians with years of experience in luxury and performance vehicles
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-white">
                      <Shield className="h-5 w-5 text-orange-400 mr-3" />
                      Quality Assured
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-200">
                      100% genuine parts and comprehensive warranty on all services
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-white">
                      <Clock className="h-5 w-5 text-orange-400 mr-3" />
                      Quick Turnaround
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-200">
                      Efficient service delivery without compromising on quality
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        {/* Footer Stats */}
        <footer className="p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-gray-300">Happy Customers</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Wrench className="h-6 w-6 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-white">1000+</div>
                <div className="text-sm text-gray-300">Services Done</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-white">4.9★</div>
                <div className="text-sm text-gray-300">Average Rating</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-300">Emergency Service</div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default WelcomePage;
