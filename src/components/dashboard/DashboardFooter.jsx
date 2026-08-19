import React from 'react';

export default function DashboardFooter() {
  return (
    <footer className="mt-16 border-t border-border/40 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">TS</span>
            </div>
            <span className="font-medium text-foreground">Powered by TrackSmart Retail</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <a href="mailto:support@tracksmart.com" className="hover:text-foreground transition-colors">
              support@tracksmart.com
            </a>
            <button className="hover:text-foreground transition-colors">Mentions légales</button>
            <button className="hover:text-foreground transition-colors">Conditions d'utilisation</button>
          </div>
        </div>
      </div>
    </footer>);

}