from types import *

class VlcModule:

    _options = []

    _valid_modules = ['standard', 'transcode', 'duplicate', 'display', 'rtp', 'es']

    def __init__(self, name):
        if name not in self._valid_modules:
            raise ValueError('Not a valid module name')

        self._name = name

    def __str__(self):
        output = self._name + "{"
        for i, option in enumerate(self._options):
            if option[1]:
                output += "{0}={1}".format(option[0], option[1])
                if option[2]:
                    output += '{'
                    for j, parameter_option in enumerate(option[2]):
                        if type(parameter_option[1]) == bool:
                            output += parameter_option[0]
                        else:
                            output += "{0}={1}".format(parameter_option[0], parameter_option[1])

                        if j == len(option[2]) - 1:
                            output += '}'
                        else:
                            output += ','
            else:
                output += option[0]

            if i == len(self._options) - 1:
                output += '}'
            else:
                output += ','

        return output

    def getName(self):
        return self._name

    def setOption(self, opt_name, param=None, valid_params=None, param_opts=[], valid_param_opts=[]):
        if valid_params:
            if param in valid_params:
                self.validateParamOpts(param, param_opts, valid_param_opts)
                self._options.append([opt_name, param, param_opts])
            else:
                raise NameError("{0} is not a valid param for option {1}".format(parm, opt_name))
        # Assume the child class has validified the parameter
        else:
            self._options.append([opt_name, param, param_opts])

    def getOption(self, opt_name):
        for option in self._options:
            if opt_name == option[0]:
                return [option[1], option[2]]

        return None

    # TODO: Needs fixing. Non functional for checking parameter options
    def validateParamOpts(self, param, param_opts, valid_param_opts):
        if not param_opts:
            return True

        for param_opt in param_opts:
                if param in valid_param_opts:
                    for valid_opt in valid_param_opts[param]:
                        if param_opt[0] != valid_opt[0]:
                            raise NameError("{0} is not a valid option name for parameter {1} of the {2} module".format(param_opt[0], param, self._name))

                        if type(param_opt[1]) != type(valid_opt[1]):
                            raise TypeError("{0} is not the correct type for option {1} paramater {2} of the {3} module".format(type(param_opt[1], param_opt[0], param, self._name)))
                   
                else:
                    raise NameError("{0} parameter for {1} option not does have any options to be set".format(param, opt_name))

                return True

