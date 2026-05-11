import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  Shield,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Stethoscope,
  Heart,
  Activity,
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <Star className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium">Trusted by 10,000+ patients</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Book Doctor Appointments{' '}
              <span className="text-blue-200">With Ease</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Skip the waiting room. Find the right doctor, choose your time, and
              book instantly. Healthcare made simple.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Book Now
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all border border-white/20"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose MedBook?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make healthcare accessible with a seamless booking experience
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: CalendarDays,
                title: 'Easy Scheduling',
                desc: 'Book appointments in seconds with our intuitive calendar interface.',
                color: 'blue',
              },
              {
                icon: Users,
                title: 'Expert Doctors',
                desc: 'Choose from our network of qualified and experienced specialists.',
                color: 'green',
              },
              {
                icon: Clock,
                title: 'Real-time Slots',
                desc: 'See available time slots instantly and pick what works for you.',
                color: 'purple',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                desc: 'Your health data is protected with enterprise-grade security.',
                color: 'orange',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-5`}
                  style={{
                    backgroundColor:
                      feature.color === 'blue'
                        ? '#dbeafe'
                        : feature.color === 'green'
                          ? '#dcfce7'
                          : feature.color === 'purple'
                            ? '#f3e8ff'
                            : '#ffedd5',
                  }}
                >
                  <feature.icon
                    className="h-7 w-7"
                    style={{
                      color:
                        feature.color === 'blue'
                          ? '#2563eb'
                          : feature.color === 'green'
                            ? '#16a34a'
                            : feature.color === 'purple'
                              ? '#9333ea'
                              : '#ea580c',
                    }}
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">Three simple steps to your appointment</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                icon: Users,
                title: 'Find a Doctor',
                desc: 'Browse our network of specialists and find the right doctor for you.',
              },
              {
                step: '2',
                icon: CalendarDays,
                title: 'Pick a Time',
                desc: 'Choose from available time slots that fit your schedule.',
              },
              {
                step: '3',
                icon: CheckCircle,
                title: 'Get Confirmed',
                desc: 'Receive instant confirmation and reminders for your appointment.',
              },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: '50+', label: 'Expert Doctors' },
              { icon: Heart, value: '10K+', label: 'Happy Patients' },
              { icon: Stethoscope, value: '15+', label: 'Specializations' },
              { icon: Activity, value: '99%', label: 'Satisfaction Rate' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <p className="text-3xl md:text-4xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of patients who trust MedBook for their healthcare needs.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all shadow-lg"
          >
            Create Free Account
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-blue-400" />
              <span className="text-white font-bold text-lg">MedBook</span>
            </div>
            <p className="text-sm">&copy; 2025 MedBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
