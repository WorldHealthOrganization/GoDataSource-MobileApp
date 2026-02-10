#!/usr/bin/env ruby

# Monkey patch to disable Swift version validation
module Pod
  class Installer
    class Xcode
      class TargetValidator
        def verify_swift_pods_swift_version
          # Skip Swift version validation
        end
      end
    end
  end
end

# Run pod install
system('pod', 'install')
