import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Clock, Calendar, Users } from "lucide-react";
import { MyAIInvoicesLogo } from "./MyAIInvoicesLogo";

export function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <MyAIInvoicesLogo />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            Coming Soon
          </CardTitle>
          <p className="text-gray-600 text-lg">
            We're working hard to bring you an amazing booking experience
          </p>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <Clock className="h-5 w-5" />
            <span>Stay tuned for updates</span>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              What to expect:
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Easy appointment scheduling</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Seamless client management</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Real-time availability</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            In the meantime, you can still access our other features through the
            main dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
